import { useColorScheme } from 'react-native';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { lightColors, darkColors, ThemeColors } from '@/constants/themes';

export function useThemeColors(): ThemeColors {
  const appearance = usePreferencesStore((s) => s.appearance);
  const systemScheme = useColorScheme();

  if (appearance === 'Dark') return darkColors;
  if (appearance === 'Light') return lightColors;
  return systemScheme === 'dark' ? darkColors : lightColors;
}

export function useIsDark(): boolean {
  const appearance = usePreferencesStore((s) => s.appearance);
  const systemScheme = useColorScheme();

  if (appearance === 'Dark') return true;
  if (appearance === 'Light') return false;
  return systemScheme === 'dark';
}
