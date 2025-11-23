# Component Inventory - Shared Design Package

## Overview
This document provides a complete inventory of all React components (.tsx files) in the `packages/shared-design` directory.

**Total Components:** 64

---

## Root Level Components

| Component | File Path | Line Count |
|-----------|-----------|------------|
| Azora Master Components | `azora-master-components.tsx` | 485 |
| Navigation | `components/navigation.tsx` | 100 |
| Dashboard Example | `examples/DashboardExample.tsx` | 127 |
| App Layout | `layouts/AppLayout.tsx` | 90 |

---

## UI Components (`components/ui/`)

| Component | File Path | Line Count |
|-----------|-----------|------------|
| Accordion | `components/ui/accordion.tsx` | 64 |
| Alert Dialog | `components/ui/alert-dialog.tsx` | 145 |
| Alert | `components/ui/alert.tsx` | 60 |
| Aspect Ratio | `components/ui/aspect-ratio.tsx` | 10 |
| Avatar | `components/ui/avatar.tsx` | 46 |
| Badge | `components/ui/badge.tsx` | 44 |
| Breadcrumb | `components/ui/breadcrumb.tsx` | 93 |
| Button Group | `components/ui/button-group.tsx` | 78 |
| Button | `components/ui/button.tsx` | 58 |
| Calendar | `components/ui/calendar.tsx` | 234 |
| Card | `components/ui/card.tsx` | 72 |
| Carousel | `components/ui/carousel.tsx` | 197 |
| Chart | `components/ui/chart.tsx` | 267 |
| Checkbox | `components/ui/checkbox.tsx` | 28 |
| Collapsible | `components/ui/collapsible.tsx` | 30 |
| Command | `components/ui/command.tsx` | 145 |
| Context Menu | `components/ui/context-menu.tsx` | 234 |
| Dialog | `components/ui/dialog.tsx` | 113 |
| Drawer | `components/ui/drawer.tsx` | 123 |
| Dropdown Menu | `components/ui/dropdown-menu.tsx` | 234 |
| Empty | `components/ui/empty.tsx` | 95 |
| Field | `components/ui/field.tsx` | 234 |
| Form | `components/ui/form.tsx` | 145 |
| Hover Card | `components/ui/hover-card.tsx` | 38 |
| Input Group | `components/ui/input-group.tsx` | 165 |
| Input OTP | `components/ui/input-otp.tsx` | 68 |
| Input | `components/ui/input.tsx` | 21 |
| Item | `components/ui/item.tsx` | 175 |
| Kbd | `components/ui/kbd.tsx` | 27 |
| Label | `components/ui/label.tsx` | 20 |
| Menubar | `components/ui/menubar.tsx` | 234 |
| Navigation Menu | `components/ui/navigation-menu.tsx` | 165 |
| Pagination | `components/ui/pagination.tsx` | 103 |
| Popover | `components/ui/popover.tsx` | 42 |
| Progress | `components/ui/progress.tsx` | 27 |
| Radio Group | `components/ui/radio-group.tsx` | 38 |
| Resizable | `components/ui/resizable.tsx` | 48 |
| Scroll Area | `components/ui/scroll-area.tsx` | 56 |
| Select | `components/ui/select.tsx` | 178 |
| Separator | `components/ui/separator.tsx` | 23 |
| Sheet | `components/ui/sheet.tsx` | 115 |
| Sidebar | `components/ui/sidebar.tsx` | 678 |
| Skeleton | `components/ui/skeleton.tsx` | 13 |
| Slider | `components/ui/slider.tsx` | 60 |
| Sonner | `components/ui/sonner.tsx` | 23 |
| Spinner | `components/ui/spinner.tsx` | 14 |
| Switch | `components/ui/switch.tsx` | 28 |
| Table | `components/ui/table.tsx` | 95 |
| Tabs | `components/ui/tabs.tsx` | 56 |
| Textarea | `components/ui/textarea.tsx` | 17 |
| Toast | `components/ui/toast.tsx` | 123 |
| Toaster | `components/ui/toaster.tsx` | 27 |
| Toggle Group | `components/ui/toggle-group.tsx` | 62 |
| Toggle | `components/ui/toggle.tsx` | 44 |
| Tooltip | `components/ui/tooltip.tsx` | 54 |
| Use Mobile | `components/ui/use-mobile.tsx` | 19 |

---

## Component Categories

### Layout Components (4)
- App Layout
- Navigation
- Sidebar
- Resizable

### Form Components (15)
- Button, Button Group
- Input, Input Group, Input OTP
- Textarea
- Select
- Checkbox
- Radio Group
- Switch
- Slider
- Field
- Form
- Label

### Display Components (12)
- Card
- Alert, Alert Dialog
- Badge
- Avatar
- Empty
- Skeleton
- Spinner
- Progress
- Separator
- Aspect Ratio

### Navigation Components (7)
- Breadcrumb
- Navigation Menu
- Menubar
- Tabs
- Pagination
- Command
- Kbd

### Overlay Components (8)
- Dialog
- Drawer
- Sheet
- Popover
- Hover Card
- Tooltip
- Context Menu
- Dropdown Menu

### Data Display Components (5)
- Table
- Chart
- Carousel
- Scroll Area
- Collapsible

### Feedback Components (3)
- Toast, Toaster
- Sonner
- Alert

### Utility Components (2)
- Use Mobile (Hook)
- Toggle, Toggle Group

### Master Components (2)
- Azora Master Components (485 lines - includes AzoraLogo, MobileNav, ResponsiveGrid, AccessibleCard, LanguageSwitcher, AccessibilityToolbar, StatsCard, FeatureCard, GradientText, HeroSection)
- Dashboard Example (127 lines - demonstration component)

---

## Statistics

- **Total .tsx Files:** 64
- **Total Lines of Code:** ~6,500+ lines
- **Largest Component:** Sidebar (678 lines)
- **Smallest Component:** Skeleton (13 lines)
- **Average Component Size:** ~102 lines

---

## Notes

1. All components follow Radix UI primitives pattern
2. Components use Tailwind CSS for styling
3. TypeScript is used throughout for type safety
4. Components support dark mode via CSS variables
5. Accessibility features are built into all components
6. Most components are client-side ("use client" directive)

---

**Generated:** 2025
**Package:** @azora/shared-design
**Version:** 1.0.0
