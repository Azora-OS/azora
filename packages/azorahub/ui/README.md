# Azora UI - Material Design 3 Component Library

A comprehensive, Google-inspired component library implementing Material Design 3 with Azora's unique enhancements and branding.

## 🎨 Overview

Azora UI brings the power and elegance of Google's Material Design 3 to the Azorahub ecosystem. Built with modern React, TypeScript, and Tailwind CSS, it provides a complete set of accessible, customizable, and beautiful components that follow Google's design principles while maintaining Azora's distinctive identity.

## 🚀 Enhanced Features vs Standard Material Design

### Google's Foundation + Azora's Innovations
- **Material You Personalization**: Dynamic color schemes that adapt to user preferences
- **Advanced Theming**: Multi-layered theming with brand-specific customizations
- **AI-Enhanced Components**: Smart components with predictive behaviors
- **Living Design**: Components that adapt based on usage patterns and context
- **Enterprise Features**: Built-in accessibility, compliance, and analytics
- **Performance Optimized**: Lightweight components with intelligent loading

### Unique Azora Enhancements
- **Intelligent Components**: Components that learn from user interactions
- **Contextual Awareness**: Components that adapt to content and environment
- **Real-time Collaboration**: Built-in collaboration features for team usage
- **Advanced Analytics**: Usage tracking and optimization suggestions
- **Cross-Platform Consistency**: Unified experience across web, mobile, and desktop

## 🎯 Design Principles

### Material Design 3 Core Principles
1. **Material is the metaphor**: Inspired by paper and ink
2. **Bold, graphic, intentional**: Core elements are bold and deliberate
3. **Motion provides meaning**: Transitions and animations are purposeful
4. **Adaptive and flexible**: Works across all devices and platforms

### Azora's Extensions
1. **Intelligence First**: Components that anticipate user needs
2. **Accessibility Always**: WCAG 2.1 AA compliance by default
3. **Performance Matters**: Optimized for speed and efficiency
4. **Community Driven**: Open and extensible for community contributions

## 🧩 Component Categories

### Foundation Components
- **Buttons**: Text, contained, outlined, floating action, icon buttons
- **Text Fields**: Standard, outlined, filled, multiline, with validation
- **Cards**: Elevation, outlined, interactive, media cards
- **Lists**: Standard, navigation, selection, interactive lists
- **Navigation**: Bottom navigation, navigation rails, app bars, tabs

### Feedback Components
- **Dialogs**: Alert, confirmation, full-screen, custom dialogs
- **Snackbars**: Standard, action-based, persistent snackbars
- **Progress**: Linear, circular, indeterminate progress indicators
- **Tooltips**: Standard, rich, interactive tooltips
- **Badges**: Standard, overlap, dot badges

### Selection Components
- **Checkboxes**: Standard, indeterminate, custom checkboxes
- **Radio Buttons**: Standard, custom radio buttons
- **Switches**: Standard, custom switches with animations
- **Sliders**: Discrete, continuous, range sliders
- **Chips**: Filter, input, choice, suggestion chips

### Data Display Components
- **Tables**: Standard, enhanced, interactive data tables
- **Dividers**: Standard, inset, full-bleed dividers
- **Expansion Panels**: Accordion-style content organization
- **Steppers**: Linear, alternative, mobile steppers
- **Tree Views**: Hierarchical data visualization

### Surfaces
- **Sheets**: Bottom, side, modal sheets
- **Menus**: Dropdown, context, overflow menus
- **Drawers**: Standard, modal, mini variant drawers
- **Containers**: Flexible layout containers

## 🎨 Design Tokens

### Color System
```typescript
// Primary color scheme (Material You inspired)
const lightColors = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
};

// Dark color scheme
const darkColors = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
  scrim: '#000000',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#6750A4',
};
```

### Typography Scale
```typescript
const typography = {
  displayLarge: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '57px',
    lineHeight: '64px',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '45px',
    lineHeight: '52px',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '36px',
    lineHeight: '44px',
    letterSpacing: '0px',
  },
  headlineLarge: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '32px',
    lineHeight: '40px',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '28px',
    lineHeight: '36px',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '24px',
    lineHeight: '32px',
    letterSpacing: '0px',
  },
  titleLarge: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '22px',
    lineHeight: '28px',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  bodyLarge: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.4px',
  },
  labelLarge: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: '11px',
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
};
```

### Shape System
```typescript
const shape = {
  cornerNone: 0,
  cornerExtraSmall: 4,
  cornerSmall: 8,
  cornerMedium: 12,
  cornerLarge: 16,
  cornerExtraLarge: 28,
};

const elevation = {
  level0: '0px 0px 0px rgba(0, 0, 0, 0.12)',
  level1: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
  level2: '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
  level3: '0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12)',
  level4: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)',
  level5: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
};
```

## 🔧 Installation & Setup

### Package Installation
```bash
# Install the core UI library
npm install @azorahub/ui

# Install required peer dependencies
npm install @emotion/react @emotion/styled @mui/material @mui/icons-material

# Optional: Install theme extensions
npm install @azorahub/ui-theme @azorahub/ui-icons
```

### Basic Setup
```typescript
// app/providers.tsx
import { AzoraThemeProvider } from '@azorahub/ui';
import { CssBaseline } from '@mui/material';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AzoraThemeProvider theme="light" mode="auto">
      <CssBaseline />
      {children}
    </AzoraThemeProvider>
  );
}
```

### Custom Theme Configuration
```typescript
// app/theme.ts
import { createAzoraTheme } from '@azorahub/ui';

const customTheme = createAzoraTheme({
  palette: {
    primary: {
      main: '#6750A4', // Azora brand color
    },
    secondary: {
      main: '#625B71',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
        },
      },
    },
  },
});

export default customTheme;
```

## 📱 Usage Examples

### Basic Components
```typescript
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@azorahub/ui';

function ExampleComponent() {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Welcome to Azora UI
        </Typography>
        <TextField
          label="Enter your email"
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button variant="contained" color="primary">
            Get Started
          </Button>
          <Button variant="outlined" color="secondary">
            Learn More
          </Button>
        </div>
        <Chip label="New" color="primary" size="small" />
      </CardContent>
    </Card>
  );
}
```

### Advanced Components
```typescript
import {
  DataTable,
  NavigationBar,
  SearchBar,
  FilterChip,
  ActionMenu,
} from '@azorahub/ui';

function AdvancedExample() {
  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  return (
    <div>
      <NavigationBar
        title="User Management"
        actions={[
          { label: 'Add User', onClick: () => console.log('Add user') },
          { label: 'Export', onClick: () => console.log('Export') },
        ]}
      />
      <SearchBar
        placeholder="Search users..."
        onSearch={(query) => console.log('Search:', query)}
      />
      <DataTable
        columns={columns}
        data={data}
        selectable
        pagination
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
    </div>
  );
}
```

## 🎯 Advanced Features

### Intelligent Components
```typescript
import { SmartButton, PredictiveInput } from '@azorahub/ui';

function IntelligentExample() {
  return (
    <div>
      {/* Button that learns from user interactions */}
      <SmartButton
        variant="contained"
        learnFromUsage
        predictNextAction
        onPredict={(action) => console.log('Predicted action:', action)}
      >
        Intelligent Action
      </SmartButton>

      {/* Input that provides smart suggestions */}
      <PredictiveInput
        label="Smart Search"
        predictSuggestions
        onSuggestion={(suggestion) => console.log('Suggestion:', suggestion)}
      />
    </div>
  );
}
```

### Real-time Collaboration
```typescript
import { CollaborativeEditor, LiveCursor } from '@azorahub/ui';

function CollaborationExample() {
  return (
    <div>
      <CollaborativeEditor
        documentId="doc-123"
        enableLiveCursors
        enableComments
        onUserJoined={(user) => console.log('User joined:', user)}
        onUserLeft={(user) => console.log('User left:', user)}
      />
      <LiveCursor
        userId="user-456"
        position={{ x: 100, y: 200 }}
        color="#6750A4"
      />
    </div>
  );
}
```

## 🎨 Theme Customization

### Dynamic Theming
```typescript
import { useDynamicTheme } from '@azorahub/ui';

function DynamicThemeExample() {
  const { theme, setTheme, toggleMode } = useDynamicTheme();

  return (
    <div>
      <Button onClick={() => setTheme('dark')}>Dark Theme</Button>
      <Button onClick={() => setTheme('light')}>Light Theme</Button>
      <Button onClick={() => toggleMode()}>Toggle Mode</Button>
    </div>
  );
}
```

### Brand Customization
```typescript
const brandTheme = createAzoraTheme({
  palette: {
    primary: {
      main: '#your-brand-color',
      light: '#your-light-color',
      dark: '#your-dark-color',
      contrastText: '#your-contrast-color',
    },
    // ... other brand colors
  },
  typography: {
    fontFamily: 'Your Brand Font, Roboto, sans-serif',
    // ... custom typography
  },
});
```

## 🔍 Accessibility Features

### Built-in Accessibility
- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Screen Reader Support**: Full support for assistive technologies
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast Mode**: Optimized for high contrast themes
- **Reduced Motion**: Respects user's motion preferences

### Accessibility Utilities
```typescript
import { useAccessibility, AccessibilityProvider } from '@azorahub/ui';

function AccessibleComponent() {
  const { announceToScreenReader, focusManagement } = useAccessibility();

  return (
    <Button
      onClick={() => {
        announceToScreenReader('Action completed successfully');
        focusManagement.focusNext();
      }}
    >
      Accessible Button
    </Button>
  );
}
```

## 📊 Performance Optimization

### Lazy Loading
```typescript
import { LazyComponent, VirtualizedList } from '@azorahub/ui';

function PerformanceExample() {
  return (
    <div>
      {/* Lazy load heavy components */}
      <LazyComponent
        component={() => import('./HeavyComponent')}
        fallback={<div>Loading...</div>}
      />

      {/* Virtualize long lists */}
      <VirtualizedList
        items={largeDataArray}
        itemHeight={60}
        renderItem={({ item, index }) => (
          <div key={index}>{item.name}</div>
        )}
      />
    </div>
  );
}
```

## 🧪 Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@azorahub/ui';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Documentation & Resources

### Storybook
```bash
# Run Storybook to explore components
npm run storybook
```

### Design Tokens
- [Color System](./docs/color-system.md)
- [Typography Scale](./docs/typography.md)
- [Shape & Elevation](./docs/shape-elevation.md)
- [Motion & Animation](./docs/motion.md)

### Component Guides
- [Getting Started](./docs/getting-started.md)
- [Theming](./docs/theming.md)
- [Accessibility](./docs/accessibility.md)
- [Performance](./docs/performance.md)

## 🤝 Contributing

### Development Setup
```bash
# Clone the repository
git clone https://github.com/azorahub/ui.git
cd ui

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Component Development
1. **Design First**: Create designs in Figma following Material Design 3
2. **Implement**: Build components with TypeScript and React
3. **Test**: Write comprehensive tests for accessibility and functionality
4. **Document**: Add Storybook stories and documentation
5. **Review**: Submit pull request for code review

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: [ui.azorahub.com](https://ui.azorahub.com)
- **Storybook**: [storybook.azorahub.com](https://storybook.azorahub.com)
- **Issues**: [GitHub Issues](https://github.com/azorahub/ui/issues)
- **Discussions**: [GitHub Discussions](https://github.com/azorahub/ui/discussions)

### Community
- **Discord**: [discord.azorahub.com](https://discord.azorahub.com)
- **Twitter**: [@azorahubui](https://twitter.com/azorahubui)

---

**Building beautiful, accessible, and intelligent user interfaces with Google's Material Design 3 and Azora's innovations 🚀**
