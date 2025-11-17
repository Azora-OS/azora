import { MD3LightTheme } from 'react-native-paper';

export const AzoraTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6', // Sapphire Blue
    secondary: '#10B981', // Emerald Green  
    tertiary: '#EF4444', // Ruby Red
    surface: '#FFFFFF',
    background: '#F8FAFC',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    ubuntu: {
      sapphire: '#3B82F6',
      emerald: '#10B981', 
      ruby: '#EF4444',
      unity: '#FFFFFF'
    }
  },
  ubuntu: {
    philosophy: 'I am because we are',
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24
    }
  }
};