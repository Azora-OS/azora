/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
import { createTheme, Theme } from '@mui/material/styles';
import { AzoraPaletteOptions } from './palette';
import { AzoraTypographyOptions } from './typography';
import { AzoraShapeOptions } from './shape';
import { AzoraComponentOverrides } from './overrides';

export interface AzoraThemeOptions {
  palette?: AzoraPaletteOptions;
  typography?: AzoraTypographyOptions;
  shape?: AzoraShapeOptions;
  spacing?: (factor: number) => string;
  breakpoints?: {
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
  components?: AzoraComponentOverrides;
}

export const createAzoraTheme = (options: AzoraThemeOptions = {}): Theme => {
  const defaultTheme = createTheme();

  const azoraTheme = createTheme({
    ...defaultTheme,
    palette: {
      ...defaultTheme.palette,
      ...options.palette,
    },
    typography: {
      ...defaultTheme.typography,
      ...options.typography,
    },
    shape: {
      ...defaultTheme.shape,
      ...options.shape,
    },
    spacing: options.spacing || defaultTheme.spacing,
    breakpoints: {
      ...defaultTheme.breakpoints,
      ...options.breakpoints,
    },
    components: {
      ...defaultTheme.components,
      ...options.components,
    },
  });

  // Add Azora-specific custom properties
  (azoraTheme as any).azorahub = {
    version: '1.0.0',
    designSystem: 'material-design-3',
    intelligentComponents: true,
    accessibilityLevel: 'AA',
  };

  return azoraTheme;
};

export const lightTheme = createAzoraTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4',
      light: '#D0BCFF',
      dark: '#6750A4',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#625B71',
      light: '#CCC2DC',
      dark: '#625B71',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#7D5260',
      light: '#EFB8C8',
      dark: '#7D5260',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#BA1A1A',
      light: '#FFB4AB',
      dark: '#BA1A1A',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#7D5700',
      light: '#FFB951',
      dark: '#7D5700',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#146C2E',
      light: '#4FAC70',
      dark: '#146C2E',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#006496',
      light: '#7FD4FF',
      dark: '#006496',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFBFE',
      paper: '#FFFFFF',
    },
    surface: {
      default: '#FFFBFE',
      variant: '#E7E0EC',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
      disabled: '#79747E',
    },
    divider: '#CAC4D0',
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '57px',
      lineHeight: '64px',
      letterSpacing: '-0.25px',
    },
    h2: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '45px',
      lineHeight: '52px',
      letterSpacing: '0px',
    },
    h3: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '36px',
      lineHeight: '44px',
      letterSpacing: '0px',
    },
    h4: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '32px',
      lineHeight: '40px',
      letterSpacing: '0px',
    },
    h5: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '28px',
      lineHeight: '36px',
      letterSpacing: '0px',
    },
    h6: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '24px',
      lineHeight: '32px',
      letterSpacing: '0px',
    },
    subtitle1: {
      fontFamily: 'Roboto',
      fontWeight: 500,
      fontSize: '22px',
      lineHeight: '28px',
      letterSpacing: '0px',
    },
    subtitle2: {
      fontFamily: 'Roboto',
      fontWeight: 500,
      fontSize: '16px',
      lineHeight: '24px',
      letterSpacing: '0.15px',
    },
    body1: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '16px',
      lineHeight: '24px',
      letterSpacing: '0.5px',
    },
    body2: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0.25px',
    },
    button: {
      fontFamily: 'Roboto',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '0.1px',
      textTransform: 'none',
    },
    caption: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0.4px',
    },
    overline: {
      fontFamily: 'Roboto',
      fontWeight: 400,
      fontSize: '11px',
      lineHeight: '16px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export const darkTheme = createAzoraTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D0BCFF',
      light: '#D0BCFF',
      dark: '#6750A4',
      contrastText: '#381E72',
    },
    secondary: {
      main: '#CCC2DC',
      light: '#CCC2DC',
      dark: '#625B71',
      contrastText: '#332D41',
    },
    tertiary: {
      main: '#EFB8C8',
      light: '#EFB8C8',
      dark: '#7D5260',
      contrastText: '#492532',
    },
    error: {
      main: '#FFB4AB',
      light: '#FFB4AB',
      dark: '#BA1A1A',
      contrastText: '#690005',
    },
    warning: {
      main: '#FFB951',
      light: '#FFB951',
      dark: '#7D5700',
      contrastText: '#402D00',
    },
    success: {
      main: '#4FAC70',
      light: '#4FAC70',
      dark: '#146C2E',
      contrastText: '#00390F',
    },
    info: {
      main: '#7FD4FF',
      light: '#7FD4FF',
      dark: '#006496',
      contrastText: '#003547',
    },
    background: {
      default: '#1C1B1F',
      paper: '#2B2930',
    },
    surface: {
      default: '#1C1B1F',
      variant: '#49454F',
    },
    text: {
      primary: '#E6E1E5',
      secondary: '#CAC4D0',
      disabled: '#938F99',
    },
    divider: '#49454F',
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  spacing: lightTheme.spacing,
  breakpoints: lightTheme.breakpoints,
});

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export type AzoraTheme = Theme & {
  azorahub: {
    version: string;
    designSystem: string;
    intelligentComponents: boolean;
    accessibilityLevel: string;
  };
};

export default createAzoraTheme;

