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

  text: string;
  textSecondary: string;
  textMuted: string;
  textLight: string;

  border: string;
  borderLight: string;

  success: string;
  warning: string;
  error: string;
  info: string;

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

  text: '#111111',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  success: '#059669',
  warning: '#D97706',
  error: '#EF4444',
  info: '#0891B2',

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
  surfaceElevated: '#222222',
  cardBg: '#1E1E1E',

  text: '#F5F5F5',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textLight: '#FFFFFF',

  border: '#2A2A2A',
  borderLight: '#222222',

  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#22D3EE',

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
