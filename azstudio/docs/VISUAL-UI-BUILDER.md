# Visual UI Builder

The Visual UI Builder is a comprehensive system for generating React components, forms, and API-connected UIs from visual designs in AzStudio.

## Features

### 1. Component Generation (UIBuilder)

Generate complete Next.js pages and React components from visual layouts.

**Key Capabilities:**
- Next.js App Router support with server/client component separation
- Responsive layouts with Tailwind CSS
- Component types: forms, tables, cards, modals, buttons, inputs, layouts, navigation, etc.
- Automatic code generation from visual canvas
- Bidirectional sync between visual design and code

**Example Usage:**

```typescript
import { UIBuilder, PageLayout, UIComponent } from '@/services';

const builder = new UIBuilder({ framework: 'next', useAppRouter: true });

const layout: PageLayout = {
  name: 'Dashboard',
  route: '/dashboard',
  components: [
    {
      id: 'header',
      type: 'header',
      props: {},
      position: { x: 0, y: 0 },
      children: [
        {
          id: 'nav',
          type: 'nav',
          props: {},
          position: { x: 0, y: 0 },
        }
      ]
    },
    {
      id: 'content',
      type: 'layout',
      props: {},
      position: { x: 0, y: 100 },
      children: [
        {
          id: 'user-list',
          type: 'card',
          props: {},
          position: { x: 0, y: 0 },
          apiConnection: {
            endpointId: 'getUsers',
            operation: 'query',
          }
        }
      ]
    }
  ],
  metadata: {
    title: 'Dashboard',
    description: 'User dashboard page',
  }
};

const changes = builder.generatePage(layout, '/output', endpoints);
```

### 2. API Connection System (APIConnectionManager)

Generate React Query hooks for seamless API integration with loading states, error handling, and optimistic updates.

**Key Capabilities:**
- Generate `useQuery` hooks for GET requests
- Generate `useMutation` hooks for POST/PUT/PATCH/DELETE requests
- Automatic TypeScript type generation from schemas
- Loading and error state handling
- Optimistic updates support
- Authentication header injection

**Example Usage:**

```typescript
import { APIConnectionManager, APIEndpoint, APIConnection } from '@/services';

const manager = new APIConnectionManager();

const endpoint: APIEndpoint = {
  id: 'getUsers',
  method: 'GET',
  path: '/api/users',
  responseSchema: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
  requiresAuth: true,
};

const connection: APIConnection = {
  componentId: 'user-list',
  endpointId: 'getUsers',
  operation: 'query',
};

// Generate React Query hook
const changes = manager.generateReactQueryHook(
  { hookName: 'useGetUsers', endpoint, connection },
  '/output'
);

// Or generate a complete connected component
const componentChanges = manager.generateConnectedComponent(
  'user-list',
  endpoint,
  connection,
  '/output'
);
```

**Generated Hook Example:**

```typescript
// hooks/use-get-users.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export interface GetUsersResponse {
  id: string;
  name: string;
  email: string;
}

async function fetchGetUsers(): Promise<GetUsersResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function useGetUsers(
  options?: Omit<UseQueryOptions<GetUsersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchGetUsers(),
    ...options,
  });
}
```

### 3. Form Builder (FormBuilder)

Generate complete forms with React Hook Form and Zod validation that syncs with backend schemas.

**Key Capabilities:**
- React Hook Form integration
- Zod schema validation
- Field types: text, email, password, number, tel, url, date, textarea, select, checkbox, radio
- Validation rules: required, min/max length, min/max value, pattern matching
- Error display with user-friendly messages
- Submit endpoint integration with loading/error states
- Success redirect support
- Reset functionality

**Example Usage:**

```typescript
import { FormBuilder, FormSpec } from '@/services';

const builder = new FormBuilder();

const spec: FormSpec = {
  id: 'registration-form',
  name: 'RegistrationForm',
  fields: [
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      placeholder: 'Enter your username',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'your@email.com',
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
      validation: {
        minLength: 8,
      },
    },
    {
      name: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' },
      ],
    },
    {
      name: 'acceptTerms',
      type: 'checkbox',
      label: 'I accept the terms and conditions',
      required: true,
    },
  ],
  submitEndpoint: '/api/register',
  submitMethod: 'POST',
  onSuccessRedirect: '/dashboard',
};

const changes = builder.generateForm(spec, '/output');
```

**Generated Form Component:**

```typescript
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { registrationFormSchema, type RegistrationFormFormData } from '@/schemas/registration-form-schema';

export default function RegistrationForm({ defaultValues, onSubmit }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationFormFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data: RegistrationFormFormData) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
  });

  const onSubmitHandler = async (data: RegistrationFormFormData) => {
    try {
      await mutation.mutateAsync(data);
      router.push('/dashboard');
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6 max-w-2xl">
      {/* Form fields with validation and error display */}
    </form>
  );
}
```

**Generated Zod Schema:**

```typescript
import { z } from 'zod';

export const registrationFormSchema = z.object({
  username: z.string({ required_error: 'Username is required' })
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(20, { message: 'Username must be at most 20 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username format is invalid' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  country: z.enum(['us', 'ca', 'uk']),
  acceptTerms: z.boolean(),
});

export type RegistrationFormFormData = z.infer<typeof registrationFormSchema>;
```

## Integration with Visual Canvas

All three systems work together seamlessly:

1. **Visual Canvas** → User drags components and connects them to APIs
2. **UIBuilder** → Generates React components from canvas layout
3. **APIConnectionManager** → Creates React Query hooks for API connections
4. **FormBuilder** → Generates forms with validation when form components are used

The visual canvas maintains the component tree, and when the user clicks "Generate Code", all three systems work together to produce a complete, working application with:
- Responsive UI components
- API data fetching with loading/error states
- Form validation synced with backend schemas
- Type-safe TypeScript code
- Accessibility-compliant markup

## Testing

All three systems have comprehensive test coverage:

```bash
# Run all UI builder tests
npm test -- APIConnectionManager.test.ts FormBuilder.test.ts UIBuilder.test.ts

# Run specific test suite
npm test -- FormBuilder.test.ts
```

## Requirements Fulfilled

This implementation fulfills the following requirements from the AzStudio spec:

- **Requirement 11.1**: Visual UI builder with drag-and-drop components ✅
- **Requirement 11.2**: Generate Next.js pages with App Router ✅
- **Requirement 11.3**: Connect UI components to API endpoints ✅
- **Requirement 11.4**: Generate responsive UI with Tailwind CSS ✅
- **Requirement 11.5**: Create forms with validation matching backend schemas ✅

## Next Steps

Future enhancements could include:

1. Visual form designer with drag-and-drop field placement
2. Real-time preview of generated components
3. Component library with pre-built templates
4. Advanced validation rules (custom validators, async validation)
5. Multi-step form support
6. File upload components with progress tracking
7. Rich text editor integration
8. Data table with sorting, filtering, and pagination
