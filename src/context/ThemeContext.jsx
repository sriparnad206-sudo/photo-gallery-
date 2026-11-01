import { useEffect } from 'react';
import { ThemeContext } from './ThemeContextDef';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('app_theme', 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
