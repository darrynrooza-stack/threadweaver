import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface InteractionModalContextType {
  isOpen: boolean;
  openModal: (partnerId?: string) => void;
  closeModal: () => void;
  preselectedPartnerId?: string;
}

const InteractionModalContext = createContext<InteractionModalContextType | undefined>(undefined);

export function InteractionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preselectedPartnerId, setPreselectedPartnerId] = useState<string | undefined>();

  const openModal = useCallback((partnerId?: string) => {
    setPreselectedPartnerId(partnerId);
    setIsOpen(true);
  }, []);

  // Global keyboard shortcut: Cmd/Ctrl+L
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        openModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  const closeModal = () => {
    setIsOpen(false);
    setPreselectedPartnerId(undefined);
  };

  return (
    <InteractionModalContext.Provider value={{ isOpen, openModal, closeModal, preselectedPartnerId }}>
      {children}
    </InteractionModalContext.Provider>
  );
}

export function useInteractionModal() {
  const context = useContext(InteractionModalContext);
  if (!context) {
    throw new Error('useInteractionModal must be used within InteractionModalProvider');
  }
  return context;
}
