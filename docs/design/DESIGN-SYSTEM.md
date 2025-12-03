# 🎨 Azora Design System

> **World-class UI/UX system powering the Constitutional AI Operating System**

## Overview

The Azora Design System is built on **shadcn/ui** with the **New York** style variant, providing a modern, accessible, and performant foundation for all Azora applications.

## Design Philosophy

### Core Principles
1. **Constitutional by Design** - Every component respects user rights and accessibility
2. **Ubuntu Philosophy** - "I can because we can" - collaborative and inclusive
3. **Mobile-First** - Optimized for 2G networks and emerging markets
4. **Performance** - Sub-10ms response times, minimal bundle sizes
5. **Accessibility** - WCAG 2.1 AA compliant across all components

## Design Tokens

### Color System

#### Brand Colors
```css
--azora-purple: #667eea;    /* Primary brand color */
--azora-violet: #764ba2;    /* Secondary brand color */
--elara-pink: #f093fb;      /* AI assistant accent */
```

#### Semantic Colors
```css
--success: #4ade80;         /* Green - success states */
--warning: #fbbf24;         /* Amber - warning states */
--danger: #ef4444;          /* Red - error/destructive states */
--info: #3b82f6;            /* Blue - informational states */
```

#### Light Theme
```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 262 83% 58%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--muted: 210 40% 96.1%;
--border: 214.3 31.8% 91.4%;
--ring: 262 83% 58%;
```

#### Dark Theme
```css
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 262 83% 58%;
--card: 222.2 84% 4.9%;
--border: 217.2 32.6% 17.5%;
```

### Typography

#### Font Families
- **Primary**: Geist (sans-serif) - Modern, readable, optimized for screens
- **Monospace**: Geist Mono - Code blocks and technical content
- **Fallback**: system-ui, -apple-system, sans-serif

#### Type Scale
```
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
text-6xl:  3.75rem  (60px)
```

### Spacing System

Based on 4px base unit (0.25rem):
```
0:   0px
1:   4px    (0.25rem)
2:   8px    (0.5rem)
3:   12px   (0.75rem)
4:   16px   (1rem)
6:   24px   (1.5rem)
8:   32px   (2rem)
12:  48px   (3rem)
16:  64px   (4rem)
20:  80px   (5rem)
```

### Border Radius
```
--radius: 0.5rem (8px) - Default
rounded-sm:  0.125rem (2px)
rounded:     0.25rem  (4px)
rounded-md:  0.375rem (6px)
rounded-lg:  0.5rem   (8px)
rounded-xl:  0.75rem  (12px)
rounded-2xl: 1rem     (16px)
rounded-full: 9999px
```

## Responsive Design

### Breakpoints
```
sm:  640px   - Mobile landscape
md:  768px   - Tablet
lg:  1024px  - Desktop
xl:  1280px  - Large desktop
2xl: 1536px  - Extra large
```

### Mobile-First Strategy
- All designs start at 320px width (smallest mobile)
- Progressive enhancement for larger screens
- Touch targets minimum 44x44px
- Optimized for 2G networks (< 50KB initial load)

## Component Library

### 60+ Production Components

#### Layout Components
- Card, Separator, Sidebar, Sheet, Resizable

#### Navigation
- Navbar, MobileNav, Breadcrumb, Pagination, Tabs

#### Form Components
- Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Calendar, Form

#### Feedback Components
- Alert, Toast, Progress, Spinner, Skeleton, Badge

#### Overlay Components
- Dialog, Drawer, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu

#### Data Display
- Table, Chart, Avatar, Empty, Accordion

## Accessibility Features

### Built-in Accessibility
- ARIA Labels - All interactive elements properly labeled
- Keyboard Navigation - Full keyboard support
- Focus Management - Visible focus indicators
- Screen Reader Support - Semantic HTML and ARIA
- Color Contrast - WCAG AA compliant (4.5:1 minimum)

### Accessibility Toolbar
- Font Size Control - 80% to 120% scaling
- High Contrast Mode - Enhanced visibility
- Dyslexic Font - Specialized typography

## Performance Optimization

### 2G Network Optimization
- Initial bundle < 50KB gzipped
- Critical CSS inlined
- Font subsetting for used characters
- Image optimization (WebP, AVIF)

## Theming

### Theme Provider
```tsx
import { ThemeProvider } from "@/components/theme-provider"

<ThemeProvider defaultTheme="system" storageKey="azora-theme">
  {children}
</ThemeProvider>
```

### Theme Switching
- Light Mode, Dark Mode, System, Auto

## Usage Guidelines

### Component Import
```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

### Utility Function
```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", conditional && "conditional-class")} />
```

---

**Built with Ubuntu Philosophy** 💚  
*"I can because we can"*
