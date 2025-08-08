/**
 * Theme provider component for light/dark mode switching
 */

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      themes={['light', 'dark', 'system']}
      storageKey="cryptosniper-theme"
    >
      {children}
    </NextThemeProvider>
  );
}
