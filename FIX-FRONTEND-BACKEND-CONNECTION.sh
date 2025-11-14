#!/bin/bash
# Minimal script to connect frontend to backend - NO MORE DOCS, JUST CODE

set -e

echo "🔧 FIXING FRONTEND-BACKEND CONNECTION..."
echo ""

# Step 1: Fix API Gateway routing
echo "1️⃣ Fixing API Gateway routes..."
cat > services/api-gateway/routes/education.js << 'EOF'
const express = require('express');
const router = express.Router();

const EDUCATION_URL = process.env.EDUCATION_URL || 'http://localhost:3074';

// Proxy all education requests
router.all('*', async (req, res) => {
  try {
    const url = `${EDUCATION_URL}${req.path}`;
    const response = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      ...(req.method !== 'GET' && { body: JSON.stringify(req.body) })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({ error: 'Education service unavailable' });
  }
});

module.exports = router;
EOF

# Step 2: Update API Gateway index to use education routes
echo "2️⃣ Adding education routes to gateway..."
# This will be added manually to avoid breaking existing code

# Step 3: Fix student portal API calls
echo "3️⃣ Fixing student portal API calls..."
cat > apps/student-portal/hooks/use-courses.ts << 'EOF'
"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api-provider";

export function useCourses() {
  const api = useApi();
  
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.lms.getCourses();
      return response.success ? response.courses : [];
    },
  });
}

export function useCourse(id: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => api.lms.getCourse(id),
    enabled: !!id,
  });
}
EOF

# Step 4: Fix enrollment hook
echo "4️⃣ Fixing enrollment hook..."
cat > apps/student-portal/hooks/use-enroll.ts << 'EOF'
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api-provider";

export function useEnroll() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string) => {
      // Get student ID from localStorage or context
      const studentId = localStorage.getItem('studentId') || 'demo-student-id';
      return await api.lms.enroll(courseId, studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}
EOF

# Step 5: Create API provider
echo "5️⃣ Creating API provider..."
cat > apps/student-portal/lib/api-provider.tsx << 'EOF'
"use client";

import { createContext, useContext } from 'react';
import { AzoraApiClient } from '@azora/api-client';

const ApiContext = createContext<AzoraApiClient | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const api = new AzoraApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  });

  // Set auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) api.setAuthToken(token);
  }

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi must be used within ApiProvider');
  return api;
}
EOF

echo ""
echo "✅ FIXES APPLIED!"
echo ""
echo "📝 MANUAL STEPS REQUIRED:"
echo ""
echo "1. Add to services/api-gateway/index.js (around line 400):"
echo "   const educationRoutes = require('./routes/education');"
echo "   app.use('/api/education', educationRoutes);"
echo ""
echo "2. Wrap student-portal app with ApiProvider in app/layout.tsx:"
echo "   import { ApiProvider } from '@/lib/api-provider';"
echo "   <ApiProvider><QueryClientProvider>...</QueryClientProvider></ApiProvider>"
echo ""
echo "3. Start services:"
echo "   Terminal 1: cd services/azora-education && npm start"
echo "   Terminal 2: cd services/api-gateway && npm start"
echo "   Terminal 3: cd apps/student-portal && npm run dev"
echo ""
echo "4. Test: http://localhost:3000/courses"
echo ""
