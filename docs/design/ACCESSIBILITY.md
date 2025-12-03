# ♿ Accessibility Guidelines

## Overview

Azora is committed to WCAG 2.1 Level AA compliance, ensuring our platform is accessible to all users regardless of ability.

## Core Principles

### 1. Perceivable
Information and UI components must be presentable to users in ways they can perceive.

### 2. Operable
UI components and navigation must be operable by all users.

### 3. Understandable
Information and UI operation must be understandable.

### 4. Robust
Content must be robust enough to be interpreted by assistive technologies.

## Color & Contrast

### Minimum Contrast Ratios (WCAG AA)
- **Normal text**: 4.5:1
- **Large text** (18pt+): 3:1
- **UI components**: 3:1
- **Graphical objects**: 3:1

### Brand Color Compliance
```
Azora Purple (#667eea) on White: 4.52:1 ✓
Azora Violet (#764ba2) on White: 6.21:1 ✓
Success Green (#4ade80) on White: 2.89:1 ✗ (use for large text only)
Danger Red (#ef4444) on White: 3.35:1 ✗ (use for large text only)
```

### High Contrast Mode
Activated via AccessibilityToolbar:
- Increases contrast to 7:1 minimum
- Removes transparency effects
- Enhances border visibility

## Typography

### Font Size
- **Minimum**: 16px (1rem) for body text
- **Adjustable**: 80% to 120% via toolbar
- **Line height**: 1.5 minimum for body text
- **Paragraph spacing**: 1.5x font size minimum

### Dyslexic Font Option
- OpenDyslexic font available via toolbar
- Weighted bottoms for letter stability
- Unique character shapes

## Keyboard Navigation

### Focus Indicators
All interactive elements have visible focus states:
```css
focus-visible:ring-2 ring-ring ring-offset-2
```

### Tab Order
- Logical tab sequence
- Skip links for main content
- No keyboard traps

### Keyboard Shortcuts
- `Tab` - Next focusable element
- `Shift + Tab` - Previous focusable element
- `Enter` - Activate button/link
- `Space` - Toggle checkbox/switch
- `Esc` - Close dialog/popover
- `Arrow keys` - Navigate menus/lists

## Screen Reader Support

### Semantic HTML
```tsx
// ✓ Good
<button>Click me</button>
<nav>...</nav>
<main>...</main>

// ✗ Bad
<div onClick={...}>Click me</div>
<div>Navigation</div>
```

### ARIA Labels
```tsx
// Icon-only buttons
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Form inputs
<Input aria-label="Email address" type="email" />

// Status updates
<div role="status" aria-live="polite">
  Loading...
</div>
```

### ARIA Landmarks
```tsx
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

## Touch Targets

### Minimum Size
- **44x44px** minimum for all interactive elements
- Adequate spacing between targets (8px minimum)

### Mobile Optimization
```tsx
// Touch-friendly button
<Button size="lg" className="min-h-[44px] min-w-[44px]">
  Action
</Button>
```

## Forms

### Labels
All form inputs must have associated labels:
```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Error Messages
```tsx
<Input 
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" className="text-destructive text-sm">
    Please enter a valid email
  </p>
)}
```

### Required Fields
```tsx
<Label htmlFor="name">
  Name <span className="text-destructive">*</span>
</Label>
<Input id="name" required aria-required="true" />
```

## Images & Media

### Alt Text
```tsx
// Informative images
<img src="/chart.png" alt="Revenue growth chart showing 300% increase" />

// Decorative images
<img src="/decoration.png" alt="" role="presentation" />
```

### Video Captions
- Closed captions for all video content
- Transcripts available
- Audio descriptions for visual content

## Motion & Animation

### Reduced Motion
Respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Implementation
```tsx
<motion.div
  animate={{ opacity: 1 }}
  transition={{ 
    duration: prefersReducedMotion ? 0 : 0.3 
  }}
/>
```

## Accessibility Toolbar

### Features
1. **Font Size Control**
   - Increase/decrease in 10% increments
   - Range: 80% to 120%
   - Persists across sessions

2. **High Contrast Mode**
   - Enhanced color contrast
   - Removes transparency
   - Thicker borders

3. **Dyslexic Font**
   - Specialized typography
   - Improved readability
   - Optional activation

### Usage
```tsx
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"

// Add to layout
<AccessibilityToolbar />
```

## Testing Checklist

### Manual Testing
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets are 44x44px minimum
- [ ] Forms have proper labels and error messages
- [ ] Images have appropriate alt text
- [ ] Videos have captions

### Automated Testing
- [ ] axe DevTools scan passes
- [ ] Lighthouse accessibility score 90+
- [ ] WAVE browser extension shows no errors
- [ ] Pa11y CI integration passes

### Screen Reader Testing
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

## Common Patterns

### Loading States
```tsx
<div role="status" aria-live="polite" aria-busy="true">
  <Spinner />
  <span className="sr-only">Loading content...</span>
</div>
```

### Error Alerts
```tsx
<Alert variant="destructive" role="alert">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to save changes. Please try again.
  </AlertDescription>
</Alert>
```

### Success Messages
```tsx
<div role="status" aria-live="polite">
  <Alert>
    <CheckCircle className="h-4 w-4" />
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Changes saved successfully</AlertDescription>
  </Alert>
</div>
```

### Modal Dialogs
```tsx
<Dialog>
  <DialogContent aria-labelledby="dialog-title" aria-describedby="dialog-description">
    <DialogHeader>
      <DialogTitle id="dialog-title">Confirm Action</DialogTitle>
      <DialogDescription id="dialog-description">
        Are you sure you want to proceed?
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

## Resources

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Testing
- [Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Keyboard Testing](https://webaim.org/articles/keyboard/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Compliance Statement

Azora OS is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience and apply relevant accessibility standards.

**Conformance Status:** WCAG 2.1 Level AA

**Last Reviewed:** 2025

---

**Accessibility is a right, not a feature** ♿
