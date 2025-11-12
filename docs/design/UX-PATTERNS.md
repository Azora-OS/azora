# 🎯 UX Patterns & User Flows

## Overview

Documented UX patterns and user flows for the Azora platform.

## Core User Journeys

### 1. Student Onboarding
```
Landing Page → Sign Up → Profile Setup → Course Selection → Dashboard
```

**Key Touchpoints:**
- Value proposition clear within 3 seconds
- Social proof (125K users, $6.4M revenue)
- One-click sign up options (Google, GitHub)
- Progressive profile completion
- Personalized course recommendations

### 2. Learning Flow
```
Dashboard → Browse Courses → Course Detail → Enroll → Learn → Complete → Earn AZR
```

**Features:**
- AI-powered recommendations
- Progress tracking
- Interactive IDE integration
- Real-time feedback
- Blockchain credential issuance

### 3. Revenue Generation
```
Dashboard → AZORA Forge → Create Project → Build → Deploy → Earn Revenue
```

**Features:**
- Project templates
- AI assistance
- Integrated deployment
- Revenue tracking
- 90% student share

## Design Patterns

### Navigation Patterns

#### Primary Navigation
```tsx
// Desktop: Top navbar with links
// Mobile: Hamburger menu with drawer

<Navbar>
  <Logo />
  <NavLinks /> {/* Desktop only */}
  <AuthButtons />
  <MobileMenuButton /> {/* Mobile only */}
</Navbar>
```

#### Secondary Navigation
```tsx
// Tabs for section switching
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>
</Tabs>
```

#### Breadcrumb Navigation
```tsx
// Hierarchical navigation
<Breadcrumb>
  <BreadcrumbItem>Home</BreadcrumbItem>
  <BreadcrumbItem>Courses</BreadcrumbItem>
  <BreadcrumbItem>Web Development</BreadcrumbItem>
</Breadcrumb>
```

### Content Patterns

#### Hero Section
```tsx
<section className="relative overflow-hidden py-20">
  {/* Background gradients */}
  <div className="absolute inset-0">
    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
  </div>
  
  {/* Content */}
  <div className="relative max-w-7xl mx-auto">
    <h1 className="text-5xl font-bold">
      Constitutional AI <span className="gradient-text">Operating System</span>
    </h1>
    <p className="text-xl text-muted-foreground">
      Transform education, finance, and technology
    </p>
    <div className="flex gap-3">
      <Button size="lg">Get Started</Button>
      <Button variant="outline" size="lg">Learn More</Button>
    </div>
  </div>
</section>
```

#### Feature Grid
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map(feature => (
    <Card key={feature.id}>
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </Card>
  ))}
</div>
```

#### Stats Display
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map(stat => (
    <div key={stat.label} className="text-center">
      <div className="text-3xl font-bold text-primary">{stat.value}</div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </div>
  ))}
</div>
```

### Form Patterns

#### Multi-Step Form
```tsx
const [step, setStep] = useState(1)

<div className="space-y-6">
  {/* Progress indicator */}
  <Progress value={(step / totalSteps) * 100} />
  
  {/* Step content */}
  {step === 1 && <PersonalInfo />}
  {step === 2 && <Preferences />}
  {step === 3 && <Confirmation />}
  
  {/* Navigation */}
  <div className="flex justify-between">
    <Button variant="outline" onClick={() => setStep(step - 1)}>
      Back
    </Button>
    <Button onClick={() => setStep(step + 1)}>
      {step === totalSteps ? 'Submit' : 'Next'}
    </Button>
  </div>
</div>
```

#### Inline Validation
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    aria-invalid={emailError ? 'true' : 'false'}
  />
  {emailError && (
    <p className="text-sm text-destructive">{emailError}</p>
  )}
  {emailValid && (
    <p className="text-sm text-success flex items-center gap-1">
      <CheckCircle className="h-4 w-4" /> Valid email
    </p>
  )}
</div>
```

### Loading Patterns

#### Skeleton Screens
```tsx
// Show content structure while loading
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
) : (
  <Content data={data} />
)}
```

#### Progressive Loading
```tsx
// Load critical content first
<Suspense fallback={<Skeleton />}>
  <CriticalContent />
</Suspense>

<Suspense fallback={null}>
  <SecondaryContent />
</Suspense>
```

#### Optimistic Updates
```tsx
// Update UI immediately, rollback on error
const handleLike = async () => {
  setLiked(true) // Optimistic update
  try {
    await likePost(postId)
  } catch (error) {
    setLiked(false) // Rollback
    toast({ title: 'Failed to like post', variant: 'destructive' })
  }
}
```

### Feedback Patterns

#### Toast Notifications
```tsx
// Success
toast({
  title: 'Success',
  description: 'Your changes have been saved',
})

// Error
toast({
  title: 'Error',
  description: 'Failed to save changes',
  variant: 'destructive',
})

// Loading
toast({
  title: 'Saving...',
  description: 'Please wait',
})
```

#### Inline Alerts
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

#### Progress Indicators
```tsx
// Determinate progress
<Progress value={uploadProgress} />

// Indeterminate progress
<Spinner />
```

### Empty States

#### No Content
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
    <Inbox className="h-12 w-12 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
  <p className="text-muted-foreground mb-4">
    Start learning by enrolling in your first course
  </p>
  <Button>Browse Courses</Button>
</div>
```

#### Error State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
  <p className="text-muted-foreground mb-4">
    We couldn't load your content. Please try again.
  </p>
  <Button onClick={retry}>Retry</Button>
</div>
```

## Interactive Patterns

### Search & Filter
```tsx
<div className="space-y-4">
  {/* Search */}
  <div className="relative">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search courses..."
      className="pl-10"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
  
  {/* Filters */}
  <div className="flex gap-2 flex-wrap">
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger>
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        <SelectItem value="tech">Technology</SelectItem>
        <SelectItem value="business">Business</SelectItem>
      </SelectContent>
    </Select>
    
    <Select value={level} onValueChange={setLevel}>
      <SelectTrigger>
        <SelectValue placeholder="Level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Levels</SelectItem>
        <SelectItem value="beginner">Beginner</SelectItem>
        <SelectItem value="advanced">Advanced</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

### Pagination
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Infinite Scroll
```tsx
const { ref, inView } = useInView()

useEffect(() => {
  if (inView && hasMore) {
    loadMore()
  }
}, [inView])

<div>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
  <div ref={ref}>{isLoading && <Spinner />}</div>
</div>
```

## Educational Patterns

### Course Card
```tsx
<Card className="overflow-hidden">
  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
  <CardHeader>
    <div className="flex items-center justify-between mb-2">
      <Badge>{course.category}</Badge>
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{course.rating}</span>
      </div>
    </div>
    <CardTitle>{course.title}</CardTitle>
    <CardDescription>{course.instructor}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{course.duration}</span>
      <span>{course.students} students</span>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Enroll Now</Button>
  </CardFooter>
</Card>
```

### Progress Tracking
```tsx
<Card>
  <CardHeader>
    <CardTitle>Your Progress</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>Course Completion</span>
        <span className="font-semibold">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-2xl font-bold">{completed}</div>
        <div className="text-xs text-muted-foreground">Completed</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{inProgress}</div>
        <div className="text-xs text-muted-foreground">In Progress</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{remaining}</div>
        <div className="text-xs text-muted-foreground">Remaining</div>
      </div>
    </div>
  </CardContent>
</Card>
```

### Achievement Badge
```tsx
<div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
    <Award className="h-6 w-6 text-white" />
  </div>
  <div>
    <div className="font-semibold">Course Completed!</div>
    <div className="text-sm text-muted-foreground">
      You earned 100 AZR tokens
    </div>
  </div>
</div>
```

## Best Practices

### Consistency
- Use established patterns across the platform
- Maintain visual hierarchy
- Follow spacing system

### Feedback
- Provide immediate visual feedback
- Use appropriate loading states
- Show clear error messages

### Accessibility
- Ensure keyboard navigation
- Provide ARIA labels
- Maintain color contrast

### Performance
- Lazy load below-fold content
- Optimize images
- Use skeleton screens

---

**Consistent patterns create intuitive experiences** 🎯
