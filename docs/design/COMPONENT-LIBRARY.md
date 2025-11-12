# 📦 Component Library Documentation

## Overview

Azora's component library contains 60+ production-ready components built on shadcn/ui (New York variant).

## Component Categories

### Layout Components

#### Card
Content container with elevation and border.

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Props:**
- `className` - Additional CSS classes
- Standard div props

#### Separator
Visual divider between content sections.

**Usage:**
```tsx
import { Separator } from "@/components/ui/separator"

<Separator orientation="horizontal" />
<Separator orientation="vertical" />
```

### Navigation Components

#### Navbar
Top navigation with responsive mobile support.

**Usage:**
```tsx
import { Navbar } from "@/components/navbar"

<Navbar />
```

**Features:**
- Sticky positioning
- Backdrop blur
- Mobile responsive
- Logo and navigation links
- Auth buttons

#### MobileNav
Mobile-optimized navigation drawer.

**Usage:**
```tsx
import { MobileNav } from "@/components/mobile-nav"

<MobileNav />
```

**Features:**
- Hamburger menu
- Slide-out drawer
- Touch-optimized
- Auto-close on navigation

#### Breadcrumb
Hierarchical navigation trail.

**Usage:**
```tsx
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Form Components

#### Button
Primary interaction element with multiple variants.

**Usage:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

**Variants:**
- `default` - Primary purple gradient
- `outline` - Border only
- `ghost` - Transparent background
- `destructive` - Red for dangerous actions
- `secondary` - Muted alternative
- `link` - Text link style

**Sizes:**
- `sm` - Small (32px height)
- `default` - Medium (40px height)
- `lg` - Large (48px height)
- `icon` - Square icon button

#### Input
Text input field with validation support.

**Usage:**
```tsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

#### Select
Dropdown selection component.

**Usage:**
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox
Boolean selection component.

**Usage:**
```tsx
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox id="terms" />
<label htmlFor="terms">Accept terms</label>
```

#### Switch
Toggle component for on/off states.

**Usage:**
```tsx
import { Switch } from "@/components/ui/switch"

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

### Feedback Components

#### Alert
Informational message component.

**Usage:**
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert variant="default">
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

**Variants:**
- `default` - Neutral information
- `destructive` - Error/warning

#### Toast
Temporary notification component.

**Usage:**
```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

toast({
  title: "Success",
  description: "Operation completed successfully",
})

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
})
```

#### Progress
Loading progress indicator.

**Usage:**
```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={60} />
```

#### Skeleton
Content placeholder for loading states.

**Usage:**
```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-full" />
<Skeleton className="h-12 w-12 rounded-full" />
```

#### Badge
Status indicator component.

**Usage:**
```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Overlay Components

#### Dialog
Modal dialog component.

**Usage:**
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
```

#### Popover
Contextual overlay component.

**Usage:**
```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>Popover content</PopoverContent>
</Popover>
```

#### Tooltip
Hover information component.

**Usage:**
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Data Display Components

#### Table
Tabular data display.

**Usage:**
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Avatar
User image component with fallback.

**Usage:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/user.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Accordion
Collapsible content sections.

**Usage:**
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Custom Components

### AccessibilityToolbar
Accessibility controls for users.

**Features:**
- Font size adjustment (80%-120%)
- High contrast mode toggle
- Dyslexic font toggle
- Floating action button

**Usage:**
```tsx
import { AccessibilityToolbar } from "@/components/accessibility-toolbar"

<AccessibilityToolbar />
```

### ResponsiveGrid
Flexible grid layout component.

**Usage:**
```tsx
import { ResponsiveGrid } from "@/components/responsive-grid"

<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap={6}>
  {children}
</ResponsiveGrid>
```

## Utility Functions

### cn (Class Names)
Merge Tailwind classes with conflict resolution.

**Usage:**
```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class", className)} />
```

## Best Practices

1. **Always use semantic HTML** - Buttons should be `<button>`, links should be `<a>`
2. **Provide ARIA labels** - For screen reader accessibility
3. **Use proper variants** - Match component variant to use case
4. **Responsive by default** - Test on mobile first
5. **Performance** - Lazy load heavy components
6. **Consistent spacing** - Use design system spacing scale
7. **Color contrast** - Maintain WCAG AA compliance

## Component Composition

Components are designed to be composed:

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>User Profile</CardTitle>
      <Badge>Active</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="/user.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">John Doe</p>
        <p className="text-sm text-muted-foreground">john@example.com</p>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Edit Profile</Button>
  </CardFooter>
</Card>
```

---

**Component Library Version:** 3.0.0  
**Last Updated:** 2025
