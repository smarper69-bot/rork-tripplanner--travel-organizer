export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  secondary: string;
  secondaryLight: string;

  background: string;
  surface: string;
  surfaceElevated: string;
  cardBg: string;
  inputBackground: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;
  textOnPrimary: string;

  border: string;
  borderLight: string;

  iconDefault: string;
  iconActive: string;

  tabInactive: string;
  tabActiveBg: string;

  badgeBg: string;
  badgeText: string;

  chipBg: string;
  chipActiveBg: string;
  chipText: string;
  chipActiveText: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;

  overlay: string;
  overlayLight: string;

  categoryColors: {
    flights: string;
    accommodation: string;
    food: string;
    activities: string;
    transport: string;
    shopping: string;
    other: string;
  };

  gradients: {
    primary: [string, string];
    sunset: [string, string];
    ocean: [string, string];
  };
}

export const lightColors: ThemeColors = {
  primary: '#1A1A1A',
  primaryLight: '#333333',
  primaryDark: '#0D0D0D',
  accent: '#0891B2',
  accentLight: '#22D3EE',
  secondary: '#6B7280',
  secondaryLight: '#9CA3AF',

  background: '#F8F8F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  cardBg: '#F2F2F2',
  inputBackground: '#F3F4F6',

  text: '#111111',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  iconDefault: '#6B7280',
  iconActive: '#111111',

  tabInactive: '#6B7280',
  tabActiveBg: '#111111',

  badgeBg: 'rgba(255,255,255,0.92)',
  badgeText: '#111111',

  chipBg: '#FFFFFF',
  chipActiveBg: '#111111',
  chipText: '#6B7280',
  chipActiveText: '#FFFFFF',

  success: '#059669',
  successBg: '#D1FAE5',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#0891B2',

  overlay: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.08)',

  categoryColors: {
    flights: '#0891B2',
    accommodation: '#7C3AED',
    food: '#EA580C',
    activities: '#059669',
    transport: '#2563EB',
    shopping: '#DB2777',
    other: '#6B7280',
  },

  gradients: {
    primary: ['#111111', '#333333'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#0891B2', '#06B6D4'],
  },
};

export const darkColors: ThemeColors = {
  primary: '#F5F5F5',
  primaryLight: '#E0E0E0',
  primaryDark: '#FFFFFF',
  accent: '#22D3EE',
  accentLight: '#0891B2',
  secondary: '#9CA3AF',
  secondaryLight: '#6B7280',

  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  cardBg: '#1E1E1E',
  inputBackground: '#252525',

  text: '#F5F5F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textLight: '#FFFFFF',
  textOnPrimary: '#0F0F0F',

  border: '#2E2E2E',
  borderLight: '#252525',

  iconDefault: '#A1A1AA',
  iconActive: '#F5F5F5',

  tabInactive: '#A1A1AA',
  tabActiveBg: '#F5F5F5',

  badgeBg: 'rgba(255,255,255,0.15)',
  badgeText: '#F5F5F5',

  chipBg: '#252525',
  chipActiveBg: '#F5F5F5',
  chipText: '#A1A1AA',
  chipActiveText: '#0F0F0F',

  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningBg: '#78350F',
  error: '#F87171',
  errorBg: '#7F1D1D',
  info: '#22D3EE',

  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(255,255,255,0.06)',

  categoryColors: {
    flights: '#22D3EE',
    accommodation: '#A78BFA',
    food: '#FB923C',
    activities: '#34D399',
    transport: '#60A5FA',
    shopping: '#F472B6',
    other: '#9CA3AF',
  },

  gradients: {
    primary: ['#1A1A1A', '#0F0F0F'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#0891B2', '#06B6D4'],
  },
};
