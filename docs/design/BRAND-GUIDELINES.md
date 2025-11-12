# 🎨 Brand Guidelines

## Brand Identity

### Mission
Democratize education through Constitutional AI, empowering students to learn, code, and earn their way to financial freedom.

### Vision
The world's first Education-Venture Capital hybrid platform where Ubuntu philosophy meets quantum technology.

### Values
- **Constitutional** - Rights-respecting AI governance
- **Ubuntu** - "I am because we are" - collective success
- **Accessible** - Education for all, optimized for emerging markets
- **Transparent** - Open, honest, blockchain-verified
- **Empowering** - Students become CEOs of their future

## Logo

### Primary Logo
- **Azora Logo** - Globe with gradient (purple to violet)
- Represents global reach and technological innovation
- Available in light and dark variants

### Usage
```tsx
import { AzoraLogo } from "@/components/azora-logo"

<AzoraLogo className="h-10 w-10" />
```

### Clear Space
Maintain minimum clear space of 0.5x logo height on all sides.

### Minimum Size
- Digital: 32px height
- Print: 0.5 inches height

### Don'ts
- Don't stretch or distort
- Don't change colors
- Don't add effects (shadows, outlines)
- Don't rotate
- Don't place on busy backgrounds

## Color Palette

### Primary Colors

#### Azora Purple
```
Hex: #667eea
RGB: 102, 126, 234
HSL: 262, 83%, 58%
```
**Usage:** Primary brand color, CTAs, links, focus states

#### Azora Violet
```
Hex: #764ba2
RGB: 118, 75, 162
HSL: 276, 37%, 46%
```
**Usage:** Secondary brand color, gradients, accents

#### Elara Pink
```
Hex: #f093fb
RGB: 240, 147, 251
HSL: 295, 92%, 78%
```
**Usage:** AI assistant branding, highlights

### Gradients

#### Primary Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
**Usage:** Hero sections, CTAs, premium features

#### Subtle Gradient
```css
background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
```
**Usage:** Backgrounds, cards, subtle accents

### Semantic Colors

#### Success
```
Hex: #4ade80
RGB: 74, 222, 128
```
**Usage:** Success messages, completed states, positive metrics

#### Warning
```
Hex: #fbbf24
RGB: 251, 191, 36
```
**Usage:** Warnings, pending states, caution indicators

#### Danger
```
Hex: #ef4444
RGB: 239, 68, 68
```
**Usage:** Errors, destructive actions, critical alerts

#### Info
```
Hex: #3b82f6
RGB: 59, 130, 246
```
**Usage:** Informational messages, tips, neutral highlights

### Neutral Colors

#### Light Theme
- Background: White (#ffffff)
- Foreground: Near Black (HSL: 222.2 84% 4.9%)
- Muted: Light Gray (HSL: 210 40% 96.1%)
- Border: Soft Gray (HSL: 214.3 31.8% 91.4%)

#### Dark Theme
- Background: Dark Blue (HSL: 222.2 84% 4.9%)
- Foreground: Off White (HSL: 210 40% 98%)
- Muted: Dark Gray (HSL: 217.2 32.6% 17.5%)
- Border: Medium Gray (HSL: 217.2 32.6% 17.5%)

## Typography

### Font Families

#### Primary: Geist
- **Type:** Sans-serif
- **Usage:** Body text, headings, UI elements
- **Weights:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Characteristics:** Modern, clean, highly readable

#### Monospace: Geist Mono
- **Type:** Monospace
- **Usage:** Code blocks, technical content, data
- **Weights:** 400 (Regular), 600 (Semibold)

### Type Scale

#### Headings
```
H1: 3rem (48px) - font-bold - Hero titles
H2: 2.25rem (36px) - font-bold - Section titles
H3: 1.875rem (30px) - font-semibold - Subsection titles
H4: 1.5rem (24px) - font-semibold - Card titles
H5: 1.25rem (20px) - font-medium - Small headings
H6: 1.125rem (18px) - font-medium - Micro headings
```

#### Body Text
```
Large: 1.125rem (18px) - Emphasis text
Base: 1rem (16px) - Standard body text
Small: 0.875rem (14px) - Secondary text
Tiny: 0.75rem (12px) - Captions, labels
```

### Line Height
- Headings: 1.2
- Body text: 1.5
- Small text: 1.4

### Letter Spacing
- Headings: -0.02em (tight)
- Body: 0 (normal)
- All caps: 0.05em (wide)

## Voice & Tone

### Brand Voice
- **Empowering** - "You can become a CEO"
- **Innovative** - "World's first Constitutional AI OS"
- **Inclusive** - "Education for all, everywhere"
- **Confident** - "Ready to revolutionize education"
- **Transparent** - "90% revenue share to students"

### Tone Guidelines

#### Inspirational
```
✓ "Transform your future with Constitutional AI"
✗ "Use our AI system"
```

#### Clear & Direct
```
✓ "Earn $10K-$100K monthly while learning"
✗ "Potentially generate significant income through our platform"
```

#### Inclusive
```
✓ "Built for emerging markets, optimized for 2G networks"
✗ "Available globally"
```

#### Empowering
```
✓ "Students become CEOs of profitable projects"
✗ "Students can create projects"
```

## Imagery

### Photography Style
- **Authentic** - Real students, real success stories
- **Diverse** - Represent global user base
- **Aspirational** - Show success and achievement
- **Technology-forward** - Modern devices, coding environments

### Illustration Style
- **Geometric** - Clean shapes, modern aesthetic
- **Gradient-rich** - Use brand gradients
- **Minimalist** - Simple, clear communication
- **Purposeful** - Every element has meaning

### Icons
- **Library:** Lucide Icons
- **Style:** Outline, 2px stroke
- **Size:** 16px, 20px, 24px standard
- **Color:** Inherit from context

## UI Elements

### Buttons

#### Primary
```tsx
<Button>Get Started</Button>
```
- Purple gradient background
- White text
- Bold font weight
- Rounded corners (8px)

#### Secondary
```tsx
<Button variant="outline">Learn More</Button>
```
- Transparent background
- Purple border
- Purple text
- Rounded corners (8px)

### Cards
- White/dark background
- Subtle border
- 8px border radius
- Hover: slight elevation
- Padding: 24px

### Inputs
- Border: neutral gray
- Focus: purple ring
- Border radius: 6px
- Height: 40px (default)

## Spacing System

### Base Unit: 4px (0.25rem)

```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
```

### Layout Spacing
- Section padding: 80px vertical, 16-32px horizontal
- Card padding: 24px
- Button padding: 12px 24px
- Input padding: 8px 12px

## Animation

### Timing
- Fast: 150ms - Hover states, small transitions
- Base: 200ms - Standard transitions
- Slow: 300ms - Large movements, page transitions

### Easing
- `ease-out` - Default for most transitions
- `ease-in-out` - Smooth bidirectional animations
- `ease-in` - Exit animations

### Principles
- **Purposeful** - Guide user attention
- **Subtle** - Enhance, don't distract
- **Performant** - Use GPU-accelerated properties
- **Respectful** - Honor prefers-reduced-motion

## Accessibility

### Color Contrast
- Text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Focus States
- Visible focus ring on all interactive elements
- 2px purple ring with 2px offset

### Touch Targets
- Minimum 44x44px
- 8px spacing between targets

## Usage Examples

### Hero Section
```tsx
<section className="bg-gradient-to-b from-background via-background to-background">
  <div className="absolute inset-0">
    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
  </div>
  <div className="relative">
    <h1 className="text-5xl font-bold">
      Constitutional AI <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">Operating System</span>
    </h1>
  </div>
</section>
```

### Feature Card
```tsx
<Card className="p-6 hover:shadow-lg transition-shadow">
  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 flex items-center justify-center mb-4">
    <Icon className="h-6 w-6 text-[#667eea]" />
  </div>
  <h3 className="text-xl font-semibold mb-2">Feature Title</h3>
  <p className="text-muted-foreground">Feature description</p>
</Card>
```

## Brand Applications

### Website
- Clean, modern design
- Purple gradient accents
- High contrast for readability
- Mobile-first responsive

### Marketing Materials
- Bold headlines with gradient text
- Real student success stories
- Data-driven metrics
- Clear CTAs

### Social Media
- Consistent purple branding
- Inspirational quotes
- Student spotlights
- Platform updates

## Don'ts

### Visual
- Don't use off-brand colors
- Don't use multiple gradients in one element
- Don't use decorative fonts
- Don't overcrowd layouts

### Messaging
- Don't make unrealistic promises
- Don't use jargon without explanation
- Don't ignore accessibility
- Don't be vague about value proposition

---

**Consistency builds trust** 🎨  
*Every touchpoint reinforces our brand promise*
