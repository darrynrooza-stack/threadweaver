-- Create enum for contact roles
CREATE TYPE public.contact_role AS ENUM ('finance', 'marketing', 'technical', 'operations', 'executive', 'other');

-- Create enum for partner tiers
CREATE TYPE public.partner_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze');

-- Create enum for partner health status
CREATE TYPE public.partner_health AS ENUM ('healthy', 'attention', 'critical', 'neutral');

-- Create enum for user app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'cam', 'viewer');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'cam',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create partners table
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier partner_tier NOT NULL DEFAULT 'bronze',
    health partner_health NOT NULL DEFAULT 'neutral',
    segment TEXT,
    revenue NUMERIC DEFAULT 0,
    open_threads INTEGER DEFAULT 0,
    account_manager_id UUID REFERENCES auth.users(id),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table with role assignments
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role contact_role NOT NULL DEFAULT 'other',
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to check if user is authenticated with nmi.com email
CREATE OR REPLACE FUNCTION public.is_nmi_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (auth.jwt() ->> 'email') LIKE '%@nmi.com'
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Partners policies (all authenticated users can view, CAMs can manage their own)
CREATE POLICY "Authenticated users can view all partners"
ON public.partners FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "CAMs can insert partners"
ON public.partners FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "CAMs can update partners"
ON public.partners FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete partners"
ON public.partners FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Contacts policies
CREATE POLICY "Authenticated users can view all contacts"
ON public.contacts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage contacts"
ON public.contacts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
ON public.contacts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete contacts"
ON public.contacts FOR DELETE
TO authenticated
USING (true);

-- Create function to handle new user signup (auto-create profile and role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
    
    -- Assign default CAM role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'cam');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile and role on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();