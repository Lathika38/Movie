import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('cyber');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-obsidian', 'theme-silver', 'light');
    root.classList.add('theme-cyber', 'dark');
    root.style.colorScheme = 'dark';
    localStorage.setItem('movieos_theme', 'cyber');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'cyber', setTheme: () => {}, cycleTheme: () => {} }}>
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
