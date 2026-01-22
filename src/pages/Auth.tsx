import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { cn } from '@/lib/utils';

// Validation schema with NMI email requirement and 8 char password
const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .refine((email) => email.toLowerCase().endsWith('@nmi.com'), {
      message: 'Only @nmi.com email addresses are allowed',
    }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

const signupSchema = authSchema.extend({
  fullName: z.string().trim().min(1, { message: 'Full name is required' }),
});

export function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    setErrors({});
    setGeneralError('');

    try {
      if (isLogin) {
        authSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, fullName });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setGeneralError('Invalid email or password');
      } else {
        setGeneralError(error.message);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setGeneralError('This email is already registered. Please log in instead.');
      } else {
        setGeneralError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">NMI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CAM Intelligence</h1>
              <p className="text-xs text-muted-foreground">Partner CRM</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin 
              ? 'Enter your NMI credentials to continue' 
              : 'Register with your @nmi.com email'}
          </p>
        </div>

        {/* Form */}
        <div className="panel-card p-6">
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {/* General Error */}
            {generalError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{generalError}</p>
              </div>
            )}

            {/* Full Name (signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className={cn(
                    'w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                    errors.fullName ? 'border-destructive' : 'border-border'
                  )}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nmi.com"
                className={cn(
                  'w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                  errors.email ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'w-full px-3 py-2 bg-muted/50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30',
                  errors.password ? 'border-destructive' : 'border-border'
                )}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isLogin ? 'Signing in...' : 'Creating account...') 
                : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setGeneralError('');
                }}
                className="ml-1 text-primary font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Internal use only. Authorized NMI personnel only.
        </p>
      </div>
    </div>
  );
}
