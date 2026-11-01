import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContextDef';

export const useTheme = () => useContext(ThemeContext);
