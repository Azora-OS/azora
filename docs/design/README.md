# 🎨 Azora Design Documentation

> **World-class UI/UX system documentation for the Constitutional AI Operating System**

## Overview

This directory contains comprehensive design documentation for the Azora platform, covering design systems, component libraries, accessibility, mobile-first strategies, UX patterns, and brand guidelines.

## Documentation Structure

### 📚 Core Documentation

#### [Design System](./DESIGN-SYSTEM.md)
Complete design system documentation including:
- Design philosophy and principles
- Design tokens (colors, typography, spacing)
- Responsive design strategy
- Component library overview
- Accessibility features
- Performance optimization
- Theming system

#### [Component Library](./COMPONENT-LIBRARY.md)
Detailed component documentation with:
- 60+ production-ready components
- Usage examples and code snippets
- Props documentation
- Component composition patterns
- Best practices

#### [Accessibility Guidelines](./ACCESSIBILITY.md)
WCAG 2.1 AA compliance documentation:
- Color contrast requirements
- Keyboard navigation
- Screen reader support
- Touch target sizing
- Accessibility toolbar
- Testing checklist

#### [Mobile-First Strategy](./MOBILE-FIRST.md)
Mobile optimization documentation:
- Progressive enhancement approach
- 2G network optimization
- Touch optimization
- Responsive layouts
- Performance budgets
- Offline support

#### [UX Patterns](./UX-PATTERNS.md)
User experience patterns and flows:
- Core user journeys
- Navigation patterns
- Form patterns
- Loading states
- Feedback mechanisms
- Interactive patterns

#### [Brand Guidelines](./BRAND-GUIDELINES.md)
Brand identity and visual standards:
- Logo usage
- Color palette
- Typography
- Voice and tone
- Imagery style
- UI elements

## Quick Reference

### Design Tokens

#### Colors
```css
--azora-purple: #667eea    /* Primary brand */
--azora-violet: #764ba2    /* Secondary brand */
--elara-pink: #f093fb      /* AI assistant */
```

#### Typography
- **Primary Font**: Geist (sans-serif)
- **Monospace**: Geist Mono
- **Base Size**: 16px (1rem)

#### Spacing
- **Base Unit**: 4px (0.25rem)
- **Scale**: 0, 1, 2, 3, 4, 6, 8, 12, 16, 20

#### Breakpoints
```
sm:  640px   - Mobile landscape
md:  768px   - Tablet
lg:  1024px  - Desktop
xl:  1280px  - Large desktop
```

### Component Import

```tsx
// UI Components
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Custom Components
import { Navbar } from "@/components/navbar"
import { MobileNav } from "@/components/mobile-nav"
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"

// Utilities
import { cn } from "@/lib/utils"
```

### Common Patterns

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

#### Loading State
```tsx
{isLoading ? (
  <Skeleton className="h-12 w-full" />
) : (
  <Content data={data} />
)}
```

#### Toast Notification
```tsx
const { toast } = useToast()

toast({
  title: "Success",
  description: "Changes saved successfully",
})
```

## Design Principles

### 1. Constitutional by Design
Every component respects user rights and accessibility standards.

### 2. Ubuntu Philosophy
"I can because we can" - collaborative and inclusive design.

### 3. Mobile-First
Optimized for 2G networks and emerging markets.

### 4. Performance
Sub-10ms response times, minimal bundle sizes.

### 5. Accessibility
WCAG 2.1 AA compliant across all components.

## Key Features

### 🎨 Design System
- shadcn/ui based (New York variant)
- 60+ production components
- Comprehensive design tokens
- Dark mode support

### ♿ Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Accessibility toolbar

### 📱 Mobile-First
- 2G network optimized
- Touch-friendly (44x44px targets)
- Progressive enhancement
- Offline support

### 🚀 Performance
- < 50KB initial bundle
- Code splitting
- Lazy loading
- Image optimization

### 🎯 UX Patterns
- Documented user flows
- Consistent patterns
- Loading states
- Error handling

### 🎨 Brand Identity
- Clear guidelines
- Color system
- Typography scale
- Voice and tone

## Getting Started

### For Designers

1. **Read the Design System** - Understand tokens, components, and patterns
2. **Review Brand Guidelines** - Learn brand identity and visual standards
3. **Study UX Patterns** - Familiarize with established user flows
4. **Check Accessibility** - Ensure WCAG compliance in all designs

### For Developers

1. **Import Components** - Use pre-built UI components
2. **Follow Patterns** - Implement documented UX patterns
3. **Test Accessibility** - Run accessibility audits
4. **Optimize Performance** - Follow mobile-first guidelines

### For Product Managers

1. **Understand User Flows** - Review documented journeys
2. **Reference Patterns** - Use established UX patterns
3. **Consider Accessibility** - Ensure inclusive design
4. **Monitor Performance** - Track mobile optimization

## Tools & Resources

### Design Tools
- **Figma** - Component library (coming soon)
- **Storybook** - Interactive component playground
- **Lucide Icons** - Icon library

### Development Tools
- **shadcn/ui** - Component foundation
- **Tailwind CSS** - Utility-first CSS
- **Next.js 14** - React framework
- **TypeScript** - Type safety

### Testing Tools
- **axe DevTools** - Accessibility testing
- **Lighthouse** - Performance audits
- **WAVE** - Accessibility evaluation
- **BrowserStack** - Cross-device testing

## Contributing

### Design Contributions
1. Follow established design system
2. Maintain accessibility standards
3. Document new patterns
4. Update component library

### Code Contributions
1. Use existing components
2. Follow naming conventions
3. Add accessibility features
4. Write documentation

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed guidelines.

## Version History

### Version 3.0.0 (Current)
- Complete design system documentation
- 60+ production components
- WCAG 2.1 AA compliance
- Mobile-first optimization
- Brand guidelines

### Roadmap
- [ ] Figma component library
- [ ] Storybook integration
- [ ] Animation library
- [ ] Design tokens package
- [ ] Component playground

## Support

### Documentation Issues
- Report missing documentation
- Suggest improvements
- Request clarifications

### Design Questions
- Ask in design channel
- Review existing patterns
- Consult brand guidelines

### Accessibility Concerns
- Report accessibility issues
- Suggest improvements
- Request audits

## Related Documentation

- [Architecture Documentation](../architecture/)
- [API Documentation](../api/)
- [Developer Guides](../developer-guides/)
- [Business Reports](../business-reports/)

## Standards Compliance

- **WCAG 2.1 Level AA** - Accessibility
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling framework
- **Next.js 14** - Application framework
- **TypeScript** - Type safety

---

**Built with Ubuntu Philosophy** 💚  
*"I can because we can"*

**Design System Version:** 3.0.0  
**Last Updated:** 2025  
**Maintained by:** Azora Design Team
