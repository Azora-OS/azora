# 📱 Mobile-First Design Strategy

## Overview

Azora is designed mobile-first for emerging markets, optimized for 2G networks and low-end devices.

## Core Strategy

### Progressive Enhancement
1. **Core Content** - Works on all devices
2. **Enhanced Layout** - Tablet and desktop improvements
3. **Advanced Features** - High-bandwidth enhancements

### Mobile-First CSS
```tsx
// ✓ Mobile first
<div className="text-sm md:text-base lg:text-lg">

// ✗ Desktop first (avoid)
<div className="text-lg md:text-base sm:text-sm">
```

## Breakpoints

### Device Targets
```
Mobile:     320px - 639px   (sm breakpoint)
Tablet:     640px - 1023px  (md breakpoint)
Desktop:    1024px+         (lg breakpoint)
```

### Usage
```tsx
<div className="
  grid 
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  gap-4 md:gap-6       /* Responsive spacing */
">
```

## 2G Network Optimization

### Performance Budget
- **Initial Load**: < 50KB gzipped
- **Time to Interactive**: < 3 seconds on 2G
- **First Contentful Paint**: < 1.5 seconds

### Optimization Techniques

#### 1. Code Splitting
```tsx
// Lazy load heavy components
const Dashboard = lazy(() => import('./Dashboard'))

<Suspense fallback={<Skeleton />}>
  <Dashboard />
</Suspense>
```

#### 2. Image Optimization
```tsx
// Next.js Image with responsive sizes
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  priority={false}
  loading="lazy"
/>
```

#### 3. Font Optimization
```tsx
// Subset fonts, preload critical
import { Geist } from 'next/font/google'

const geist = Geist({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})
```

#### 4. Critical CSS
```tsx
// Inline critical CSS in <head>
<style dangerouslySetInnerHTML={{
  __html: criticalCSS
}} />
```

## Touch Optimization

### Touch Targets
- **Minimum size**: 44x44px
- **Spacing**: 8px between targets
- **Feedback**: Immediate visual response

### Touch-Friendly Components
```tsx
// Large, easy-to-tap buttons
<Button size="lg" className="w-full min-h-[48px]">
  Continue
</Button>

// Swipeable cards
<Carousel className="touch-pan-x">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</Carousel>
```

### Gesture Support
- **Swipe** - Navigate carousels, dismiss items
- **Pinch** - Zoom images (where appropriate)
- **Long press** - Context menus
- **Pull to refresh** - Update content

## Mobile Navigation

### MobileNav Component
```tsx
import { MobileNav } from "@/components/mobile-nav"

// Sticky mobile navigation
<MobileNav />
```

### Features
- Hamburger menu icon
- Slide-out drawer
- Touch-optimized links
- Auto-close on navigation
- Bottom navigation for key actions

### Bottom Navigation Pattern
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
  <div className="flex justify-around p-2">
    <Button variant="ghost" size="icon">
      <Home className="h-6 w-6" />
    </Button>
    <Button variant="ghost" size="icon">
      <Search className="h-6 w-6" />
    </Button>
    <Button variant="ghost" size="icon">
      <User className="h-6 w-6" />
    </Button>
  </div>
</nav>
```

## Responsive Typography

### Fluid Type Scale
```tsx
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  Heading
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Body text
</p>
```

### Readable Line Lengths
```tsx
// Constrain text width for readability
<p className="max-w-prose">
  Long form content...
</p>
```

## Responsive Layouts

### Stack to Grid
```tsx
// Mobile: stacked, Desktop: grid
<div className="flex flex-col md:grid md:grid-cols-2 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>
```

### Hide/Show Elements
```tsx
// Desktop only
<div className="hidden lg:block">
  Desktop sidebar
</div>

// Mobile only
<div className="block lg:hidden">
  Mobile menu
</div>
```

### Responsive Spacing
```tsx
<section className="
  px-4 md:px-6 lg:px-8     /* Horizontal padding */
  py-8 md:py-12 lg:py-16   /* Vertical padding */
">
```

## Forms on Mobile

### Stacked Labels
```tsx
// Mobile-friendly form layout
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" className="w-full" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input id="password" type="password" className="w-full" />
  </div>
  <Button className="w-full" size="lg">Submit</Button>
</div>
```

### Input Types
```tsx
// Use appropriate input types for mobile keyboards
<Input type="email" />      // Email keyboard
<Input type="tel" />        // Phone keyboard
<Input type="number" />     // Numeric keyboard
<Input type="url" />        // URL keyboard
<Input type="search" />     // Search keyboard
```

## Offline Support

### Service Worker
```tsx
// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### Offline UI
```tsx
const [isOnline, setIsOnline] = useState(navigator.onLine)

{!isOnline && (
  <Alert>
    <AlertTitle>You're offline</AlertTitle>
    <AlertDescription>
      Some features may be limited
    </AlertDescription>
  </Alert>
)}
```

## Data Saving

### Lazy Loading Images
```tsx
<img 
  src="/image.jpg" 
  loading="lazy"
  decoding="async"
/>
```

### Conditional Loading
```tsx
// Load high-res only on fast connections
const connection = navigator.connection
const shouldLoadHD = connection?.effectiveType === '4g'

<Image
  src={shouldLoadHD ? '/hd-image.jpg' : '/sd-image.jpg'}
  alt="Content"
/>
```

## Testing on Mobile

### Device Testing
- **Real devices**: Test on actual phones/tablets
- **Chrome DevTools**: Mobile emulation
- **BrowserStack**: Cross-device testing

### Network Throttling
```bash
# Chrome DevTools Network tab
- Fast 3G
- Slow 3G
- Offline
```

### Performance Testing
```bash
# Lighthouse mobile audit
lighthouse https://azora.app --preset=mobile
```

## Mobile-Specific Features

### Pull to Refresh
```tsx
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'

usePullToRefresh(() => {
  // Refresh data
  refetch()
})
```

### Native-Like Transitions
```tsx
// Slide transitions for mobile navigation
<motion.div
  initial={{ x: '100%' }}
  animate={{ x: 0 }}
  exit={{ x: '100%' }}
  transition={{ type: 'tween', duration: 0.3 }}
>
```

### Install Prompt (PWA)
```tsx
// Prompt to install as PWA
const [deferredPrompt, setDeferredPrompt] = useState(null)

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  setDeferredPrompt(e)
})

<Button onClick={() => deferredPrompt?.prompt()}>
  Install App
</Button>
```

## Best Practices

### Do's ✓
- Design for 320px width minimum
- Use large, tappable buttons (44x44px+)
- Optimize images for mobile
- Test on real devices
- Implement offline support
- Use appropriate input types
- Provide immediate feedback
- Minimize text input

### Don'ts ✗
- Don't rely on hover states
- Don't use small touch targets
- Don't load unnecessary resources
- Don't assume fast network
- Don't hide critical features on mobile
- Don't use complex gestures
- Don't ignore landscape orientation

## Performance Checklist

- [ ] Initial bundle < 50KB gzipped
- [ ] Images optimized (WebP/AVIF)
- [ ] Fonts subsetted and preloaded
- [ ] Critical CSS inlined
- [ ] Code split by route
- [ ] Lazy load below fold content
- [ ] Service worker registered
- [ ] Offline fallback implemented
- [ ] Touch targets 44x44px minimum
- [ ] Tested on 2G network

---

**Mobile-first is not mobile-only** 📱  
*Progressive enhancement for all devices*
