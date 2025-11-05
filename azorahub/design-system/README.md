 # Azora Design System - Material Design 3 Implementation

A comprehensive, unified design system implementing Google's Material Design 3 with Azora's unique enhancements and branding.

## 🎨 Overview

The Azora Design System brings the power and elegance of Google's Material Design 3 to all Azorahub components. This unified system ensures consistency across web applications, APIs, CLI tools, and documentation while maintaining Azora's distinctive identity.

## 🚀 Design Philosophy

### Material Design 3 Core Principles
1. **Material is the metaphor**: Inspired by paper and ink with realistic physics
2. **Bold, graphic, intentional**: Core elements are bold and deliberate
3. **Motion provides meaning**: Transitions and animations are purposeful
4. **Adaptive and flexible**: Works across all devices and platforms

### Azora's Design Extensions
1. **Intelligence First**: Components that anticipate user needs
2. **Accessibility Always**: WCAG 2.1 AA compliance by default
3. **Performance Matters**: Optimized for speed and efficiency
4. **Community Driven**: Open and extensible for community contributions

## 🎯 Design Tokens

### Color System

#### Primary Color Scheme (Light Theme)
```css
:root {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #EADDFF;
  --md-sys-color-on-primary-container: #21005D;
  --md-sys-color-secondary: #625B71;
  --md-sys-color-on-secondary: #FFFFFF;
  --md-sys-color-secondary-container: #E8DEF8;
  --md-sys-color-on-secondary-container: #1D192B;
  --md-sys-color-tertiary: #7D5260;
  --md-sys-color-on-tertiary: #FFFFFF;
  --md-sys-color-tertiary-container: #FFD8E4;
  --md-sys-color-on-tertiary-container: #31111D;
  --md-sys-color-error: #BA1A1A;
  --md-sys-color-on-error: #FFFFFF;
  --md-sys-color-error-container: #FFDAD6;
  --md-sys-color-on-error-container: #410002;
  --md-sys-color-background: #FFFBFE;
  --md-sys-color-on-background: #1C1B1F;
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-on-surface: #1C1B1F;
  --md-sys-color-surface-variant: #E7E0EC;
  --md-sys-color-on-surface-variant: #49454F;
  --md-sys-color-outline: #79747E;
  --md-sys-color-outline-variant: #CAC4D0;
  --md-sys-color-scrim: #000000;
  --md-sys-color-inverse-surface: #313033;
  --md-sys-color-inverse-on-surface: #F4EFF4;
  --md-sys-color-inverse-primary: #D0BCFF;
}
```

#### Dark Theme Variants
```css
:root[data-theme="dark"] {
  --md-sys-color-primary: #D0BCFF;
  --md-sys-color-on-primary: #381E72;
  --md-sys-color-primary-container: #4F378B;
  --md-sys-color-on-primary-container: #EADDFF;
  --md-sys-color-secondary: #CCC2DC;
  --md-sys-color-on-secondary: #332D41;
  --md-sys-color-secondary-container: #4A4458;
  --md-sys-color-on-secondary-container: #E8DEF8;
  --md-sys-color-background: #1C1B1F;
  --md-sys-color-on-background: #E6E1E5;
  --md-sys-color-surface: #1C1B1F;
  --md-sys-color-on-surface: #E6E1E5;
}
```

### Typography Scale

#### Display Styles
```css
.md3-typescale-display-large {
  font-family: 'Roboto';
  font-size: 57px;
  font-weight: 400;
  line-height: 64px;
  letter-spacing: -0.25px;
}

.md3-typescale-display-medium {
  font-family: 'Roboto';
  font-size: 45px;
  font-weight: 400;
  line-height: 52px;
  letter-spacing: 0px;
}

.md3-typescale-display-small {
  font-family: 'Roboto';
  font-size: 36px;
  font-weight: 400;
  line-height: 44px;
  letter-spacing: 0px;
}
```

#### Headline Styles
```css
.md3-typescale-headline-large {
  font-family: 'Roboto';
  font-size: 32px;
  font-weight: 400;
  line-height: 40px;
  letter-spacing: 0px;
}

.md3-typescale-headline-medium {
  font-family: 'Roboto';
  font-size: 28px;
  font-weight: 400;
  line-height: 36px;
  letter-spacing: 0px;
}

.md3-typescale-headline-small {
  font-family: 'Roboto';
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0px;
}
```

#### Body Styles
```css
.md3-typescale-body-large {
  font-family: 'Roboto';
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.5px;
}

.md3-typescale-body-medium {
  font-family: 'Roboto';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.25px;
}

.md3-typescale-body-small {
  font-family: 'Roboto';
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.4px;
}
```

### Shape System

#### Corner Radius
```css
:root {
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
}
```

#### Usage Guidelines
- **Corner None**: For full-width elements and dividers
- **Corner Extra Small**: For chips, badges, and small interactive elements
- **Corner Small**: For buttons, text fields, and cards
- **Corner Medium**: For sheets, dialogs, and containers
- **Corner Large**: For navigation drawers and large surfaces
- **Corner Extra Large**: For hero sections and major layout elements

### Elevation System

#### Shadow Values
```css
:root {
  --md-sys-elevation-level0: 0px 0px 0px rgba(0, 0, 0, 0.12);
  --md-sys-elevation-level1: 0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level2: 0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level3: 0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level4: 0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-level5: 0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15);
}
```

#### Elevation Hierarchy
1. **Level 0**: Background surfaces, static content
2. **Level 1**: Cards, list items, subtle hover states
3. **Level 2**: Raised buttons, dropdown menus, focused elements
4. **Level 3**: Navigation drawers, bottom sheets, dialogs
5. **Level 4**: Floating action buttons, pickers, overlays
6. **Level 5**: Modals, temporary overlays, system UI

## 🧩 Component Library

### Foundation Components

#### Buttons
```css
/* Filled Button */
.md3-button {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: var(--md-sys-shape-corner-large);
  padding: 10px 24px;
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  text-transform: none;
  box-shadow: var(--md-sys-elevation-level0);
  transition: box-shadow 0.2s ease-in-out;
}

.md3-button:hover {
  box-shadow: var(--md-sys-elevation-level1);
}

/* Outlined Button */
.md3-outlined-button {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-large);
  padding: 10px 24px;
  /* ... other styles */
}

.md3-outlined-button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

/* Text Button */
.md3-text-button {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: none;
  border-radius: var(--md-sys-shape-corner-small);
  padding: 10px 12px;
  /* ... other styles */
}

.md3-text-button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}
```

#### Cards
```css
/* Elevated Card */
.md3-elevated-card {
  background-color: var(--md-sys-color-surface-container-low);
  border-radius: var(--md-sys-shape-corner-medium);
  box-shadow: var(--md-sys-elevation-level1);
  padding: 16px;
  transition: box-shadow 0.2s ease-in-out;
}

.md3-elevated-card:hover {
  box-shadow: var(--md-sys-elevation-level2);
}

/* Filled Card */
.md3-filled-card {
  background-color: var(--md-sys-color-surface-container-highest);
  border-radius: var(--md-sys-shape-corner-medium);
  box-shadow: var(--md-sys-elevation-level0);
  padding: 16px;
}

/* Outlined Card */
.md3-outlined-card {
  background-color: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium);
  padding: 16px;
}
```

#### Chips
```css
.md3-chip {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border-radius: var(--md-sys-shape-corner-small);
  padding: 6px 16px;
  font-family: var(--md-sys-typescale-label-medium-font);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: var(--md-sys-typescale-label-medium-weight);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.md3-chip.primary {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.md3-chip.secondary {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.md3-chip.tertiary {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}
```

### Feedback Components

#### Progress Indicators
```css
/* Linear Progress */
.md3-linear-progress {
  width: 100%;
  height: 4px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: var(--md-sys-shape-corner-small);
  overflow: hidden;
}

.md3-linear-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--md-sys-color-primary) 0%, var(--md-sys-color-secondary) 100%);
  border-radius: var(--md-sys-shape-corner-small);
  transition: width 0.3s ease-in-out;
}

/* Circular Progress */
.md3-circular-progress {
  width: 40px;
  height: 40px;
  border: 4px solid var(--md-sys-color-surface-variant);
  border-top: 4px solid var(--md-sys-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### Status Indicators
```css
.md3-status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--md-sys-shape-corner-large);
  font-family: var(--md-sys-typescale-label-medium-font);
  font-size: var(--md-sys-typescale-label-medium-size);
  font-weight: 500;
}

.md3-status-indicator.online {
  background-color: #E8F5E8;
  color: #1B5E20;
}

.md3-status-indicator.degraded {
  background-color: #FFF3E0;
  color: #E65100;
}

.md3-status-indicator.offline {
  background-color: #FFEBEE;
  color: #B71C1C;
}

.md3-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
```

## 🎨 Layout System

### Spacing Scale
```css
:root {
  --md-sys-spacing-xs: 4px;
  --md-sys-spacing-sm: 8px;
  --md-sys-spacing-md: 16px;
  --md-sys-spacing-lg: 24px;
  --md-sys-spacing-xl: 32px;
  --md-sys-spacing-2xl: 48px;
  --md-sys-spacing-3xl: 64px;
}
```

### Grid System
```css
.md3-grid {
  display: grid;
  gap: var(--md-sys-spacing-md);
}

.md3-grid-cols-1 { grid-template-columns: 1fr; }
.md3-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.md3-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.md3-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.md3-grid-cols-12 { grid-template-columns: repeat(12, 1fr); }

/* Responsive breakpoints */
@media (max-width: 768px) {
  .md3-grid-cols-2 { grid-template-columns: 1fr; }
  .md3-grid-cols-3 { grid-template-columns: 1fr; }
  .md3-grid-cols-4 { grid-template-columns: 1fr; }
  .md3-grid-cols-12 { grid-template-columns: 1fr; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .md3-grid-cols-3 { grid-template-columns: repeat(2, 1fr); }
  .md3-grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
  .md3-grid-cols-12 { grid-template-columns: repeat(6, 1fr); }
}
```

### Container System
```css
.md3-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--md-sys-spacing-md);
}

.md3-container-sm { max-width: 640px; }
.md3-container-md { max-width: 768px; }
.md3-container-lg { max-width: 1024px; }
.md3-container-xl { max-width: 1280px; }
.md3-container-2xl { max-width: 1536px; }
```

## 🌈 Motion & Animation

### Transition Tokens
```css
:root {
  --md-sys-motion-duration-short: 150ms;
  --md-sys-motion-duration-medium: 250ms;
  --md-sys-motion-duration-long: 350ms;
  
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0.0, 0.0, 1.0);
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0.0, 1.0);
  --md-sys-motion-easing-decelerated: cubic-bezier(0.0, 0.0, 0.0, 1.0);
  --md-sys-motion-easing-accelerated: cubic-bezier(0.3, 0.0, 1.0, 1.0);
}
```

### Animation Classes
```css
.md3-motion-standard {
  transition: all var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-standard);
}

.md3-motion-emphasized {
  transition: all var(--md-sys-motion-duration-long) var(--md-sys-motion-easing-emphasized);
}

.md3-motion-decelerated {
  transition: all var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-decelerated);
}

.md3-motion-accelerated {
  transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-accelerated);
}
```

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Focus States**: Visible focus indicators for all interactive elements
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Reduced Motion**: Respects user's motion preferences

### Accessibility Utilities
```css
/* Focus indicators */
.md3-focusable:focus {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .md3-button {
    border: 2px solid var(--md-sys-color-on-background);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .md3-motion-standard,
  .md3-motion-emphasized,
  .md3-motion-decelerated,
  .md3-motion-accelerated {
    transition: none;
  }
}
```

## 📱 Platform Adaptations

### Web Applications
- Responsive design with mobile-first approach
- Touch-friendly interaction areas (minimum 44px)
- Progressive Web App (PWA) support
- Browser compatibility (Chrome, Firefox, Safari, Edge)

### CLI Tools
- Material Design 3 color system for terminal output
- Consistent typography and spacing in text interfaces
- Unicode-based shape system for visual elements
- Accessible color combinations for terminal displays

### API Documentation
- Material Design 3 styling for HTML documentation
- Interactive components with proper state management
- Dark/light theme support
- Responsive design for all screen sizes

## 🎯 Usage Guidelines

### Component Selection
1. **Buttons**: Use filled buttons for primary actions, outlined for secondary, text for tertiary
2. **Cards**: Use elevated cards for interactive content, filled for static, outlined for grouping
3. **Chips**: Use for filters, selections, and status indicators
4. **Progress**: Use linear for determinate progress, circular for indeterminate

### Color Usage
1. **Primary**: For main brand elements and primary actions
2. **Secondary**: For supporting elements and secondary actions
3. **Tertiary**: For accent elements and tertiary actions
4. **Surface**: For backgrounds and containers
5. **Error**: For error states and destructive actions

### Typography Hierarchy
1. **Display**: For hero sections and major headings
2. **Headline**: For section headings and page titles
3. **Title**: For component headings and card titles
4. **Body**: For main content and descriptions
5. **Label**: For form labels and small text

## 🔧 Implementation

### CSS Variables
All design tokens are available as CSS custom properties for easy customization and theming.

### JavaScript/TypeScript
Design system utilities are available as npm packages for different platforms:
- `@azorahub/ui` - React components
- `@azorahub/cli-ui` - Terminal styling
- `@azorahub/tokens` - Design tokens

### Framework Support
- **React**: Full component library with TypeScript support
- **Vue**: Component wrappers and composables
- **Angular**: Material Design 3 components
- **Svelte**: Lightweight component implementations

## 📚 Documentation & Resources

### Storybook
Interactive component playground with all variants and states:
```bash
npm run storybook
```

### Design Tokens Reference
Complete token reference with examples:
- [Color System](./tokens/color.md)
- [Typography Scale](./tokens/typography.md)
- [Shape & Elevation](./tokens/shape.md)
- [Motion & Animation](./tokens/motion.md)

### Component Guidelines
Detailed usage guidelines for each component:
- [Getting Started](./guides/getting-started.md)
- [Theming](./guides/theming.md)
- [Accessibility](./guides/accessibility.md)
- [Performance](./guides/performance.md)

## 🤝 Contributing

### Design System Maintenance
1. **Token Updates**: Follow Material Design 3 specification updates
2. **Component Enhancements**: Add new components based on user needs
3. **Platform Support**: Extend support to new platforms and frameworks
4. **Accessibility**: Continuous improvement of accessibility features

### Contribution Guidelines
1. Follow Material Design 3 principles
2. Maintain backward compatibility
3. Include comprehensive tests
4. Document all changes
5. Ensure accessibility compliance

## 📄 License

This design system is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Building beautiful, accessible, and consistent user interfaces with Google's Material Design 3 and Azora's enhancements 🚀**
