# 🎨 Azora UI Component Library

**Complete guide to the Azora OS design system and UI components**

---

## 🚀 Getting Started

### Installation
```bash
npm install @azora/ui
```

### Basic Usage
```tsx
import { Button, Card, Input } from '@azora/ui'
import '@azora/ui/styles.css'

function App() {
  return (
    <Card>
      <Input label="Email" type="email" />
      <Button variant="primary">Submit</Button>
    </Card>
  )
}
```

---

## 🎨 Design System

### Colors
```css
/* Primary Colors */
--azora-primary: #4F46E5;
--azora-primary-dark: #3730A3;
--azora-primary-light: #818CF8;

/* Secondary Colors */
--azora-secondary: #10B981;
--azora-secondary-dark: #059669;
--azora-secondary-light: #34D399;

/* Neutral Colors */
--azora-gray-50: #F9FAFB;
--azora-gray-100: #F3F4F6;
--azora-gray-900: #111827;

/* Status Colors */
--azora-success: #10B981;
--azora-warning: #F59E0B;
--azora-error: #EF4444;
--azora-info: #3B82F6;
```

### Typography
```css
/* Font Families */
--azora-font-sans: 'Inter', system-ui, sans-serif;
--azora-font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--azora-text-xs: 0.75rem;
--azora-text-sm: 0.875rem;
--azora-text-base: 1rem;
--azora-text-lg: 1.125rem;
--azora-text-xl: 1.25rem;
--azora-text-2xl: 1.5rem;
--azora-text-3xl: 1.875rem;
```

---

## 🧩 Core Components

### Button
```tsx
import { Button } from '@azora/ui'

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Input
```tsx
import { Input } from '@azora/ui'

// Basic input
<Input 
  label="Email" 
  type="email" 
  placeholder="Enter your email"
/>

// With validation
<Input 
  label="Password"
  type="password"
  required
  minLength={8}
  error="Password must be at least 8 characters"
/>
```

### Card
```tsx
import { Card } from '@azora/ui'

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Interactive card
<Card hoverable clickable onClick={() => console.log('clicked')}>
  Clickable card
</Card>
```

### Modal
```tsx
import { Modal, Button } from '@azora/ui'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md"
      >
        <p>Are you sure you want to continue?</p>
        <div className="flex gap-2 mt-4">
          <Button variant="danger">Delete</Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  )
}
```

---

## 📊 Data Display Components

### Table
```tsx
import { Table } from '@azora/ui'

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' }
]

const data = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'Student'
  }
]

<Table 
  columns={columns} 
  data={data} 
  loading={false}
/>
```

### Badge
```tsx
import { Badge } from '@azora/ui'

// Variants
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
```

### Avatar
```tsx
import { Avatar } from '@azora/ui'

// With image
<Avatar src="/avatar.jpg" alt="John Doe" />

// With initials
<Avatar name="John Doe" />

// Different sizes
<Avatar name="JD" size="sm" />
<Avatar name="JD" size="lg" />
```

---

## 🎯 Specialized Components

### Wallet Balance
```tsx
import { WalletBalance } from '@azora/ui'

<WalletBalance
  balances={{
    AZR: '1250.50',
    BTC: '0.00125',
    ETH: '0.5'
  }}
  totalValueUSD="2500.00"
/>
```

### Course Card
```tsx
import { CourseCard } from '@azora/ui'

<CourseCard
  title="Introduction to AI"
  instructor="Dr. Smith"
  price="99.99"
  currency="AZR"
  rating={4.8}
  enrollments={1250}
  level="beginner"
  duration="8 weeks"
  onEnroll={() => console.log('Enroll clicked')}
/>
```

---

## 🌙 Dark Mode

### Theme Provider
```tsx
import { ThemeProvider } from '@azora/ui'

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <YourApp />
    </ThemeProvider>
  )
}
```

---

## 📦 Component List

### Form Components
- `Button` - Interactive button with variants
- `Input` - Text input with validation
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Checkbox` - Checkbox input
- `Radio` - Radio button input

### Data Display
- `Table` - Data table with sorting/pagination
- `Badge` - Status indicators
- `Avatar` - User profile pictures
- `Card` - Content containers

### Feedback
- `Modal` - Dialog overlays
- `Toast` - Notification messages
- `Alert` - Inline alerts
- `Loading` - Loading indicators

### Layout
- `Container` - Content containers
- `Grid` - CSS Grid layouts
- `Stack` - Flexbox layouts

---

**Happy designing! 🎨**