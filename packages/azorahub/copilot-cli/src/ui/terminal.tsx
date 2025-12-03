/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
import chalk from 'chalk';
import { Box, Text } from 'ink';
import React from 'react';

// Material Design 3 Color System for Terminal
export const MD3Colors = {
  primary: {
    main: '#6750A4',
    light: '#D0BCFF',
    dark: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
  },
  secondary: {
    main: '#625B71',
    light: '#CCC2DC',
    dark: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
  },
  tertiary: {
    main: '#7D5260',
    light: '#EFB8C8',
    dark: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
  },
  surface: {
    main: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
  },
  background: {
    main: '#FFFBFE',
    onBackground: '#1C1B1F',
  },
  error: {
    main: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
  },
  success: {
    main: '#146C2E',
    onSuccess: '#FFFFFF',
    successContainer: '#4FAC70',
    onSuccessContainer: '#00390F',
  },
  warning: {
    main: '#7D5700',
    onWarning: '#FFFFFF',
    warningContainer: '#FFB951',
    onWarningContainer: '#402D00',
  },
};

// Chalk color mappings for Material Design 3
export const md3Chalk = {
  primary: chalk.hex(MD3Colors.primary.main),
  primaryLight: chalk.hex(MD3Colors.primary.light),
  secondary: chalk.hex(MD3Colors.secondary.main),
  tertiary: chalk.hex(MD3Colors.tertiary.main),
  surface: chalk.hex(MD3Colors.surface.onSurface),
  surfaceVariant: chalk.hex(MD3Colors.surface.onSurfaceVariant),
  outline: chalk.hex(MD3Colors.surface.outline),
  error: chalk.hex(MD3Colors.error.main),
  success: chalk.hex(MD3Colors.success.main),
  warning: chalk.hex(MD3Colors.warning.main),
  background: chalk.hex(MD3Colors.background.main),
  onBackground: chalk.hex(MD3Colors.background.onBackground),
};

// Typography Scale for Terminal
export const MD3Typography = {
  displayLarge: {
    fontSize: 57,
    fontWeight: 'bold',
    lineHeight: 64,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  },
};

// Shape System for Terminal
export const MD3Shape = {
  cornerNone: 0,
  cornerExtraSmall: 4,
  cornerSmall: 8,
  cornerMedium: 12,
  cornerLarge: 16,
  cornerExtraLarge: 28,
};

// Elevation System for Terminal (using Unicode characters)
export const MD3Elevation = {
  level0: '',
  level1: '░',
  level2: '▒',
  level3: '▓',
  level4: '█',
  level5: '████',
};

// Component Styles
export const TerminalComponents = {
  // Button Component
  Button: ({ 
    children, 
    variant = 'filled', 
    color = 'primary', 
    size = 'medium',
    onClick 
  }: {
    children: React.ReactNode;
    variant?: 'filled' | 'outlined' | 'text';
    color?: keyof typeof MD3Colors;
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
  }) => {
    const colorScheme = MD3Colors[color as keyof typeof MD3Colors] || MD3Colors.primary;
    const sizeStyles = {
      small: { padding: '4px 8px', fontSize: 12 },
      medium: { padding: '8px 16px', fontSize: 14 },
      large: { padding: '12px 24px', fontSize: 16 },
    };

    const style = {
      ...sizeStyles[size],
      borderRadius: MD3Shape.cornerLarge,
      fontWeight: 'bold' as const,
      textTransform: 'none' as const,
    };

    if (variant === 'filled') {
      return (
        <Box
          style={{
            ...style,
            backgroundColor: colorScheme.main,
            color: colorScheme.onPrimary,
          }}
          onClick={onClick}
        >
          {children}
        </Box>
      );
    } else if (variant === 'outlined') {
      return (
        <Box
          style={{
            ...style,
            border: `1px solid ${colorScheme.main}`,
            color: colorScheme.main,
          }}
          onClick={onClick}
        >
          {children}
        </Box>
      );
    } else {
      return (
        <Text
          style={{
            ...style,
            color: colorScheme.main,
          }}
          onClick={onClick}
        >
          {children}
        </Text>
      );
    }
  },

  // Card Component
  Card: ({ 
    children, 
    elevation = 1,
    variant = 'elevated' 
  }: {
    children: React.ReactNode;
    elevation?: number;
    variant?: 'elevated' | 'filled' | 'outlined';
  }) => {
    const elevationChar = MD3Elevation[`level${elevation}` as keyof typeof MD3Elevation];
    const borderRadius = MD3Shape.cornerMedium;

    const style = {
      borderRadius,
      padding: 16,
      marginBottom: 16,
    };

    if (variant === 'elevated') {
      return (
        <Box
          style={{
            ...style,
            backgroundColor: MD3Colors.surface.surfaceVariant,
            border: `${elevationChar} ${MD3Colors.surface.outline}`,
          }}
        >
          {children}
        </Box>
      );
    } else if (variant === 'filled') {
      return (
        <Box
          style={{
            ...style,
            backgroundColor: MD3Colors.surface.surfaceVariant,
          }}
        >
          {children}
        </Box>
      );
    } else {
      return (
        <Box
          style={{
            ...style,
            border: `1px solid ${MD3Colors.surface.outline}`,
          }}
        >
          {children}
        </Box>
      );
    }
  },

  // Chip Component
  Chip: ({ 
    children, 
    color = 'primary',
    variant = 'filled',
    icon 
  }: {
    children: React.ReactNode;
    color?: keyof typeof MD3Colors;
    variant?: 'filled' | 'outlined';
    icon?: React.ReactNode;
  }) => {
    const colorScheme = MD3Colors[color as keyof typeof MD3Colors] || MD3Colors.primary;

    const style = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      borderRadius: MD3Shape.cornerSmall,
      padding: '6px 16px',
      fontSize: 14,
      fontWeight: 'bold' as const,
    };

    if (variant === 'filled') {
      return (
        <Box
          style={{
            ...style,
            backgroundColor: colorScheme.primaryContainer || colorScheme.main,
            color: colorScheme.onPrimaryContainer || colorScheme.onPrimary,
          }}
        >
          {icon}
          {children}
        </Box>
      );
    } else {
      return (
        <Box
          style={{
            ...style,
            border: `1px solid ${colorScheme.main}`,
            color: colorScheme.main,
          }}
        >
          {icon}
          {children}
        </Box>
      );
    }
  },

  // Progress Indicator
  Progress: ({ 
    value = 0, 
    color = 'primary',
    size = 'medium' 
  }: {
    value?: number;
    color?: keyof typeof MD3Colors;
    size?: 'small' | 'medium' | 'large';
  }) => {
    const colorScheme = MD3Colors[color as keyof typeof MD3Colors] || MD3Colors.primary;
    const sizes = {
      small: { width: 100, height: 4 },
      medium: { width: 200, height: 8 },
      large: { width: 300, height: 12 },
    };

    const { width, height } = sizes[size];

    return (
      <Box style={{ width, height, backgroundColor: MD3Colors.surface.surfaceVariant, borderRadius: MD3Shape.cornerSmall }}>
        <Box
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor: colorScheme.main,
            borderRadius: MD3Shape.cornerSmall,
          }}
        />
      </Box>
    );
  },

  // Status Indicator
  StatusIndicator: ({ 
    status, 
    label 
  }: {
    status: 'online' | 'offline' | 'degraded';
    label: string;
  }) => {
    const statusColors = {
      online: MD3Colors.success.main,
      offline: MD3Colors.error.main,
      degraded: MD3Colors.warning.main,
    };

    return (
      <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: statusColors[status],
          }}
        />
        <Text style={{ color: statusColors[status], fontWeight: 'bold' }}>
          {label}
        </Text>
      </Box>
    );
  },

  // Navigation Rail
  NavigationRail: ({ 
    items, 
    activeItem 
  }: {
    items: Array<{
      id: string;
      label: string;
      icon: string;
    }>;
    activeItem: string;
  }) => {
    return (
      <Box style={{ width: 80, backgroundColor: MD3Colors.surface.surfaceVariant, padding: '16px 0' }}>
        {items.map((item) => (
          <Box
            key={item.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '12px 8px',
              borderRadius: MD3Shape.cornerLarge,
              backgroundColor: activeItem === item.id ? MD3Colors.secondary.secondaryContainer : 'transparent',
              color: activeItem === item.id ? MD3Colors.secondary.onSecondaryContainer : MD3Colors.surface.onSurfaceVariant,
              cursor: 'pointer',
            }}
          >
            <Text>{item.icon}</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
              {item.label}
            </Text>
          </Box>
        ))}
      </Box>
    );
  },

  // App Bar
  AppBar: ({ 
    title, 
    actions 
  }: {
    title: string;
    actions?: React.ReactNode[];
  }) => {
    return (
      <Box
        style={{
          backgroundColor: MD3Colors.surface.surfaceVariant,
          borderBottom: `1px solid ${MD3Colors.surface.outlineVariant}`,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: MD3Colors.surface.onSurface }}>
          {title}
        </Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {actions}
        </Box>
      </Box>
    );
  },

  // Hero Section
  Hero: ({ 
    title, 
    subtitle, 
    description,
    actions 
  }: {
    title: string;
    subtitle?: string;
    description: string;
    actions?: React.ReactNode[];
  }) => {
    return (
      <Box style={{ textAlign: 'center', padding: '48px 0' }}>
        {subtitle && (
          <Text style={{ color: MD3Colors.tertiary.main, fontSize: 14, fontWeight: 'bold', marginBottom: 16 }}>
            {subtitle}
          </Text>
        )}
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: MD3Colors.primary.main, marginBottom: 16 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 18, color: MD3Colors.surface.onSurfaceVariant, marginBottom: 32, maxWidth: 600 }}>
          {description}
        </Text>
        <Box style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {actions}
        </Box>
      </Box>
    );
  },

  // Metrics Grid
  MetricsGrid: ({ 
    metrics 
  }: {
    metrics: Array<{
      label: string;
      value: string | number;
      change?: {
        value: string;
        type: 'positive' | 'negative';
      };
    }>;
  }) => {
    return (
      <Box style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {metrics.map((metric, index) => (
          <TerminalComponents.Card key={index} elevation={1}>
            <Box style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: MD3Colors.primary.main, marginBottom: 8 }}>
                {metric.value}
              </Text>
              <Text style={{ fontSize: 14, color: MD3Colors.surface.onSurfaceVariant, fontWeight: 'bold' }}>
                {metric.label}
              </Text>
              {metric.change && (
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: metric.change.type === 'positive' ? MD3Colors.success.main : MD3Colors.error.main,
                  }}
                >
                  {metric.change.type === 'positive' ? '↑' : '↓'} {metric.change.value}
                </Text>
              )}
            </Box>
          </TerminalComponents.Card>
        ))}
      </Box>
    );
  },
};

// Utility Functions
export const TerminalUtils = {
  // Apply Material Design 3 styling to text
  styled: {
    primary: (text: string) => md3Chalk.primary(text),
    secondary: (text: string) => md3Chalk.secondary(text),
    tertiary: (text: string) => md3Chalk.tertiary(text),
    error: (text: string) => md3Chalk.error(text),
    success: (text: string) => md3Chalk.success(text),
    warning: (text: string) => md3Chalk.warning(text),
    surface: (text: string) => md3Chalk.surface(text),
    onBackground: (text: string) => md3Chalk.onBackground(text),
    bold: (text: string) => chalk.bold(text),
    dim: (text: string) => chalk.dim(text),
    italic: (text: string) => chalk.italic(text),
    underline: (text: string) => chalk.underline(text),
  },

  // Create borders with Material Design 3 corners
  border: {
    rounded: (text: string, cornerSize: number = MD3Shape.cornerMedium) => {
      const corners = '─'.repeat(cornerSize);
      return `┌${corners}┐\n│ ${text} │\n└${corners}┘`;
    },
    double: (text: string) => {
      return `╔═${text}═╗\n║ ${text} ║\n╚═${text}═╝`;
    },
  },

  // Create progress bars with Material Design 3 colors
  progressBar: (value: number, total: number = 100, width: number = 20, color: keyof typeof MD3Colors = 'primary') => {
    const colorScheme = MD3Colors[color];
    const filled = Math.round((value / total) * width);
    const empty = width - filled;
    
    const filledBar = chalk.bgHex(colorScheme.main)(' '.repeat(filled));
    const emptyBar = chalk.bgHex(MD3Colors.surface.surfaceVariant)(' '.repeat(empty));
    
    return `${filledBar}${emptyBar} ${value}%`;
  },

  // Create status indicators
  status: (status: 'online' | 'offline' | 'degraded', label: string) => {
    const statusConfig = {
      online: { color: MD3Colors.success.main, symbol: '●' },
      offline: { color: MD3Colors.error.main, symbol: '●' },
      degraded: { color: MD3Colors.warning.main, symbol: '●' },
    };

    const config = statusConfig[status];
    return `${chalk.hex(config.color)(config.symbol)} ${chalk.hex(config.color)(label)}`;
  },

  // Create styled headers
  header: (text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => {
    const styles = {
      1: () => md3Chalk.bold(md3Chalk.primary(text)),
      2: () => md3Chalk.bold(md3Chalk.secondary(text)),
      3: () => md3Chalk.bold(md3Chalk.tertiary(text)),
      4: () => md3Chalk.bold(md3Chalk.surface(text)),
      5: () => md3Chalk.bold(text),
      6: () => text,
    };

    return styles[level]();
  },

  // Create Material Design 3 styled lists
  list: (items: string[], bullet: string = '•') => {
    return items.map(item => `  ${bullet} ${item}`).join('\n');
  },

  // Create Material Design 3 styled tables
  table: (headers: string[], rows: string[][]) => {
    const columnWidths = headers.map((header, index) => 
      Math.max(header.length, ...rows.map(row => row[index]?.length || 0))
    );

    const createRow = (row: string[]) => 
      row.map((cell, index) => cell.padEnd(columnWidths[index])).join(' │ ');

    const separator = columnWidths.map(width => '─'.repeat(width)).join('─┼─');

    const headerRow = md3Chalk.bold(createRow(headers));
    const dataRows = rows.map(row => createRow(row));

    return `┌─${separator}─┐\n│ ${headerRow} │\n├─${separator}─┤\n${dataRows.map(row => `│ ${row} │`).join('\n')}\n└─${separator}─┘`;
  },
};

export { TerminalComponents as Components, TerminalUtils as Utils };

