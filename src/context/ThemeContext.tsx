'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, update: updateSession } = useSession();
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme from user session or localStorage
  useEffect(() => {
    if (session?.user && (session.user as any).theme) {
      const userTheme = (session.user as any).theme as Theme;
      setTheme(userTheme);
      applyTheme(userTheme);
    } else {
      const localTheme = localStorage.getItem('theme') as Theme;
      if (localTheme) {
        setTheme(localTheme);
        applyTheme(localTheme);
      }
    }
  }, [session]);

  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (session?.user) {
      try {
        await fetch('/api/user/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme }),
        });
        // Update NextAuth session state
        await updateSession({ theme: newTheme });
      } catch (err) {
        console.error('Failed to save theme preference', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
