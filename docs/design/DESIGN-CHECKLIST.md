# ✅ Design Implementation Checklist

## Pre-Development

### Design Review
- [ ] Design follows established design system
- [ ] All components use design tokens
- [ ] Spacing follows 4px base unit
- [ ] Colors match brand palette
- [ ] Typography uses Geist font family
- [ ] Responsive breakpoints defined (sm, md, lg, xl)

### Accessibility Review
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets are 44x44px minimum
- [ ] Focus states are visible
- [ ] ARIA labels provided for interactive elements
- [ ] Keyboard navigation planned
- [ ] Screen reader compatibility considered

### Performance Planning
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts subsetted
- [ ] Code splitting strategy defined
- [ ] Lazy loading identified
- [ ] Bundle size estimated (< 50KB target)

## During Development

### Component Implementation
- [ ] Import from `@/components/ui/*`
- [ ] Use `cn()` utility for class merging
- [ ] Follow component composition patterns
- [ ] Add proper TypeScript types
- [ ] Include loading states
- [ ] Handle error states
- [ ] Implement empty states

### Responsive Design
- [ ] Mobile-first CSS (base styles for mobile)
- [ ] Tablet breakpoint (md:) implemented
- [ ] Desktop breakpoint (lg:) implemented
- [ ] Touch-friendly on mobile
- [ ] Tested on 320px width minimum
- [ ] Grid layouts responsive
- [ ] Images responsive with proper sizes

### Accessibility Implementation
- [ ] Semantic HTML used (`<button>`, `<nav>`, `<main>`)
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] ARIA labels on icon-only buttons
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Skip links for main content

### Performance Optimization
- [ ] Images lazy loaded
- [ ] Components code split
- [ ] Critical CSS inlined
- [ ] Fonts preloaded
- [ ] Bundle analyzed
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s on 2G

## Testing Phase

### Visual Testing
- [ ] Matches design mockups
- [ ] Spacing is consistent
- [ ] Typography is correct
- [ ] Colors match brand palette
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Loading states display correctly
- [ ] Error states display correctly

### Responsive Testing
- [ ] Tested on mobile (320px - 639px)
- [ ] Tested on tablet (640px - 1023px)
- [ ] Tested on desktop (1024px+)
- [ ] Tested in portrait orientation
- [ ] Tested in landscape orientation
- [ ] No horizontal scroll
- [ ] Touch targets adequate on mobile

### Accessibility Testing
- [ ] axe DevTools scan passes (0 violations)
- [ ] Lighthouse accessibility score > 90
- [ ] WAVE browser extension shows no errors
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces correctly (NVDA/JAWS/VoiceOver)
- [ ] Color contrast verified
- [ ] Focus indicators visible
- [ ] Forms have proper labels and error messages

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Testing
- [ ] Lighthouse performance score > 90
- [ ] Bundle size < 50KB gzipped
- [ ] Images optimized
- [ ] Fonts loaded efficiently
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast on 2G network (throttled testing)

## Pre-Deployment

### Code Review
- [ ] Follows coding standards
- [ ] No console errors
- [ ] No accessibility violations
- [ ] TypeScript types correct
- [ ] Comments added where needed
- [ ] No hardcoded values (use design tokens)

### Documentation
- [ ] Component usage documented
- [ ] Props documented
- [ ] Examples provided
- [ ] Edge cases noted
- [ ] Accessibility features documented

### Final Checks
- [ ] All checklist items completed
- [ ] Design approved by design team
- [ ] Accessibility approved
- [ ] Performance metrics met
- [ ] Cross-browser tested
- [ ] Mobile tested on real devices

## Post-Deployment

### Monitoring
- [ ] Analytics tracking implemented
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] User feedback collected

### Iteration
- [ ] User feedback reviewed
- [ ] Accessibility issues addressed
- [ ] Performance optimizations applied
- [ ] Design improvements implemented

---

## Quick Reference

### Component Checklist
```tsx
// ✓ Good component implementation
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MyComponent({ className, ...props }) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      <Button 
        aria-label="Descriptive label"
        className="min-h-[44px]"
      >
        Action
      </Button>
    </div>
  )
}
```

### Accessibility Checklist
```tsx
// ✓ Accessible form
<form onSubmit={handleSubmit}>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <p id="email-error" className="text-destructive text-sm">
      Please enter a valid email
    </p>
  )}
  <Button type="submit">Submit</Button>
</form>
```

### Responsive Checklist
```tsx
// ✓ Mobile-first responsive design
<div className="
  grid 
  grid-cols-1          /* Mobile */
  md:grid-cols-2       /* Tablet */
  lg:grid-cols-3       /* Desktop */
  gap-4 md:gap-6       /* Responsive spacing */
  px-4 md:px-6 lg:px-8 /* Responsive padding */
">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

---

**Quality is not an act, it is a habit** ✅
