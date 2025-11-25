# 🎨 Frontend Integration Guide

**Complete guide for connecting Azora OS apps to backend services**

---

## 📦 API Client Package

### Installation

```bash
# From any app directory
npm install ../../packages/api-client
```

### Quick Start

```typescript
import { AzoraApiClient } from '@azora/api-client';

export const api = new AzoraApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
});
```

---

## 🎓 Student Portal Integration

```typescript
// apps/student-portal/app/courses/page.tsx
'use client';
import { useCourses } from '@azora/api-client/hooks';

export default function CoursesPage() {
  const { courses, loading } = useCourses({ level: 'beginner' });
  if (loading) return <div>Loading...</div>;
  return <div>{courses.map(c => <div key={c.id}>{c.title}</div>)}</div>;
}
```

---

## 💰 Pay UI Integration

```typescript
// apps/pay-ui/app/wallet/page.tsx
'use client';
import { useWallet } from '@azora/api-client/hooks';

export default function WalletPage() {
  const { wallet, loading } = useWallet('user-123');
  return <div>Balance: {wallet?.balance} AZR</div>;
}
```

---

## 🔐 Authentication

```typescript
import { useAuth } from '@azora/api-client/hooks';

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 📊 Service Endpoints

- **API Gateway**: `http://localhost:4000`
- **Education**: `http://localhost:4200`
- **LMS**: `http://localhost:4015`
- **Sapiens**: `http://localhost:4011`
- **Assessment**: `http://localhost:4016`

---

## 🚀 Quick Checklist

- [ ] Install API client package
- [ ] Configure environment variables
- [ ] Import and initialize client
- [ ] Use hooks for data fetching
- [ ] Implement authentication
- [ ] Add error handling

---

**"Ngiyakwazi ngoba sikwazi"** 🚀
