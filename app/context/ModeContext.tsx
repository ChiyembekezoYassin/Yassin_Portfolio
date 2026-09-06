import React, { createContext, useContext, useState, useEffect } from 'react';

type Mode = 'developer' | 'personal';

interface ModeContextType {
  mode: Mode;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    // Try to load saved preference
    const saved = localStorage.getItem('portfolio-mode');
    return (saved === 'developer' || saved === 'personal') ? saved : 'developer';
  });

  useEffect(() => {
    // Save preference
    localStorage.setItem('portfolio-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'developer' ? 'personal' : 'developer');
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
}
