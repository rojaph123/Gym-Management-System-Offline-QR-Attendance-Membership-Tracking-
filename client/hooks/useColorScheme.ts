import { useColorScheme as useRNColorScheme } from 'react-native';
import { useApp } from '@/context/AppContext';

export function useColorScheme() {
  const { isDarkMode } = useApp();
  return isDarkMode ? 'dark' : 'light';
}
