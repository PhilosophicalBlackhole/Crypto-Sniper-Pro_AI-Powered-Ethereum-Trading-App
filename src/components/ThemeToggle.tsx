/**
 * Theme toggle component for switching between light and dark modes
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
}

export function ThemeToggle({ className = '', size = 'sm', variant = 'ghost' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`${className} w-10 h-10`}
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-4 w-4 text-amber-500" />;
    } else {
      return <Moon className="h-4 w-4 text-blue-400" />;
    }
  };

  const getTooltip = () => {
    if (theme === 'light') return 'Switch to Dark Mode';
    return 'Switch to Light Mode';
  };

  return (
    <Button
      onClick={cycleTheme}
      variant={variant}
      size={size}
      className={`${className} transition-colors duration-200 hover:scale-105`}
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  );
}
