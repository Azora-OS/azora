# Design System Guide

## Overview

The Azora Design System provides a comprehensive set of components, patterns, and guidelines for building consistent, accessible user interfaces across all Azora products.

**Version**: 1.0.0  
**Last Updated**: November 2023  
**Maintained By**: Design Team

---

## Design Principles

### 1. Clarity
- Clear hierarchy and structure
- Obvious call-to-actions
- Minimal cognitive load
- Consistent patterns

### 2. Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Color contrast ratios

### 3. Consistency
- Unified visual language
- Predictable interactions
- Reusable components
- Standardized spacing

### 4. Efficiency
- Minimal clicks to complete tasks
- Smart defaults
- Progressive disclosure
- Keyboard shortcuts

### 5. Delight
- Smooth animations
- Thoughtful micro-interactions
- Personality in design
- Delightful error states

---

## Color Palette

### Primary Colors

```
Primary Blue:     #0066CC
Primary Dark:     #004499
Primary Light:    #3399FF
```

### Semantic Colors

```
Success Green:    #00AA44
Warning Orange:   #FF9900
Error Red:        #CC0000
Info Blue:        #0099FF
```

### Neutral Colors

```
White:            #FFFFFF
Light Gray:       #F5F5F5
Medium Gray:      #CCCCCC
Dark Gray:        #333333
Black:            #000000
```

### Usage

```css
/* Primary actions */
.btn-primary {
  background-color: #0066CC;
  color: #FFFFFF;
}

/* Success states */
.alert-success {
  background-color: #E8F5E9;
  border-color: #00AA44;
  color: #00AA44;
}

/* Error states */
.alert-error {
  background-color: #FFEBEE;
  border-color: #CC0000;
  color: #CC0000;
}
```

---

## Typography

### Font Family

```
Primary:   Inter (sans-serif)
Monospace: Fira Code (code blocks)
```

### Font Sizes

```
H1: 32px (2rem)
H2: 24px (1.5rem)
H3: 20px (1.25rem)
H4: 16px (1rem)
Body: 14px (0.875rem)
Small: 12px (0.75rem)
```

### Font Weights

```
Light:   300
Regular: 400
Medium:  500
Bold:    700
```

### Line Heights

```
Headings: 1.2
Body:     1.5
Code:     1.6
```

### Usage

```css
/* Heading */
h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
}

/* Body text */
p {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

/* Code */
code {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
}
```

---

## Spacing System

### Scale

```
4px   (0.25rem)
8px   (0.5rem)
12px  (0.75rem)
16px  (1rem)
24px  (1.5rem)
32px  (2rem)
48px  (3rem)
64px  (4rem)
```

### Usage

```css
/* Padding */
.card {
  padding: 24px;
}

/* Margin */
.section {
  margin-bottom: 48px;
}

/* Gap (flexbox) */
.flex-container {
  gap: 16px;
}
```

---

## Components

### Button

```html
<!-- Primary -->
<button class="btn btn-primary">Click me</button>

<!-- Secondary -->
<button class="btn btn-secondary">Cancel</button>

<!-- Danger -->
<button class="btn btn-danger">Delete</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>
```

**Variants**:
- Primary (blue)
- Secondary (gray)
- Danger (red)
- Success (green)

**Sizes**:
- Small (32px)
- Medium (40px)
- Large (48px)

### Input

```html
<!-- Text input -->
<input type="text" class="input" placeholder="Enter text">

<!-- With label -->
<label class="label">
  Email
  <input type="email" class="input" required>
</label>

<!-- With error -->
<input type="email" class="input input-error">
<span class="error-message">Invalid email</span>
```

### Card

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Modal

```html
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Modal Title</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <p>Modal content</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Alert

```html
<!-- Success -->
<div class="alert alert-success">
  <span class="alert-icon">✓</span>
  <span class="alert-message">Operation successful</span>
</div>

<!-- Error -->
<div class="alert alert-error">
  <span class="alert-icon">✕</span>
  <span class="alert-message">Something went wrong</span>
</div>

<!-- Warning -->
<div class="alert alert-warning">
  <span class="alert-icon">!</span>
  <span class="alert-message">Please review</span>
</div>
```

### Form

```html
<form class="form">
  <div class="form-group">
    <label class="label">Full Name</label>
    <input type="text" class="input" required>
  </div>

  <div class="form-group">
    <label class="label">Email</label>
    <input type="email" class="input" required>
  </div>

  <div class="form-group">
    <label class="label">Message</label>
    <textarea class="textarea" rows="4"></textarea>
  </div>

  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

---

## Patterns

### Loading State

```html
<div class="loading">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>
```

### Empty State

```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h3>No results found</h3>
  <p>Try adjusting your search criteria</p>
  <button class="btn btn-primary">Clear filters</button>
</div>
```

### Error State

```html
<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h3>Something went wrong</h3>
  <p>Please try again later</p>
  <button class="btn btn-primary">Retry</button>
</div>
```

### Pagination

```html
<div class="pagination">
  <button class="btn btn-secondary" disabled>&laquo; Previous</button>
  <span class="page-info">Page 1 of 10</span>
  <button class="btn btn-secondary">Next &raquo;</button>
</div>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Contrast Ratio**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible keyboard focus
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: For screen readers

### Keyboard Navigation

```
Tab:        Move to next element
Shift+Tab:  Move to previous element
Enter:      Activate button/link
Space:      Toggle checkbox/radio
Escape:     Close modal/menu
Arrow Keys: Navigate lists/menus
```

### Screen Reader Support

```html
<!-- Use semantic HTML -->
<button aria-label="Close menu">×</button>

<!-- Use ARIA attributes -->
<div role="alert" aria-live="polite">
  Error message
</div>

<!-- Use alt text -->
<img src="logo.png" alt="Azora Logo">
```

---

## Animations

### Transitions

```css
/* Smooth transitions */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Keyframe Animations

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  animation: fadeIn 0.3s ease-in-out;
}
```

### Micro-interactions

- Hover states (0.2s)
- Loading spinners (1s loop)
- Success animations (0.5s)
- Error shake (0.3s)

---

## Responsive Design

### Breakpoints

```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px
```

### Mobile-First Approach

```css
/* Mobile (default) */
.container {
  width: 100%;
  padding: 16px;
}

/* Tablet */
@media (min-width: 640px) {
  .container {
    width: 90%;
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    width: 1200px;
    padding: 32px;
  }
}
```

---

## Dark Mode

### Color Adjustments

```css
/* Light mode (default) */
:root {
  --bg-primary: #FFFFFF;
  --text-primary: #000000;
  --border-color: #CCCCCC;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --text-primary: #FFFFFF;
    --border-color: #333333;
  }
}
```

---

## Component Library

### Installation

```bash
npm install @azora/ui
```

### Usage

```typescript
import { Button, Card, Modal } from '@azora/ui';

export function MyComponent() {
  return (
    <Card>
      <h2>Hello</h2>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

### Storybook

```bash
npm run storybook
# Opens http://localhost:6006
```

---

## Best Practices

1. **Use semantic HTML** - Use proper heading hierarchy
2. **Maintain consistency** - Use design system components
3. **Test accessibility** - Use keyboard and screen readers
4. **Optimize performance** - Lazy load images, minimize animations
5. **Mobile-first** - Design for mobile first
6. **Document changes** - Update design system when adding components
7. **Get feedback** - Test with real users
8. **Iterate** - Continuously improve based on feedback

---

## Resources

- **Figma**: https://figma.com/azora-design-system
- **Storybook**: https://storybook.azora.io
- **Component Library**: https://github.com/azora-os/azora-ui
- **Design Guidelines**: https://design.azora.io

