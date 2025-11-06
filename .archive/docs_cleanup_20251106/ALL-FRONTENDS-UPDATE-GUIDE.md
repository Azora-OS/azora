# All Frontends UI Update Guide

## Overview

This guide details how to update ALL frontend applications in the Azora OS codebase with the premium UI overhaul.

## Frontend Applications Found

### Next.js Applications (11)
1. **Main App** - `app/` ✅ (Already updated)
2. **Synapse Academy** - `synapse/academy-ui/`
3. **Synapse Atlas** - `synapse/atlas-ui/`
4. **Synapse Council** - `synapse/council-ui/`
5. **Synapse Pulse** - `synapse/pulse-ui/`
6. **Synapse Signal** - `synapse/signal-ui/`
7. **Synapse Vault** - `synapse/vault-ui/`
8. **Synapse Vigil** - `synapse/vigil-ui/`
9. **Synapse Main App** - `synapse/main-app/`
10. **Elara IDE** - `elara-ide/`
11. **Azora UI** - `azora-ui/`
12. **UI** - `ui/`

### Vite Applications (7)
1. **Marketplace UI** - `marketplace-ui/`
2. **Pay UI** - `pay-ui/`
3. **Cloud UI** - `cloud-ui/`
4. **Dev UI** - `dev-ui/`
5. **Enterprise UI** - `enterprise-ui/`
6. **Learn UI** - `learn-ui/`
7. **Compliance UI** - `compliance-ui/`

## Step 1: Copy Components

Run the automated script to copy all premium components:

```bash
npm run update:all-frontends
```

This will:
- Copy `components/ui/` to each frontend
- Copy `components/theme-provider.tsx`
- Copy `lib/utils.ts`
- Copy `lib/design-system/premium-tokens.ts`

## Step 2: Update Layouts (Next.js Apps)

For each Next.js app, update `app/layout.tsx`:

```tsx
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Apps to update:**
- ✅ synapse/academy-ui (Already done)
- synapse/atlas-ui
- synapse/council-ui
- synapse/pulse-ui
- synapse/signal-ui
- synapse/vault-ui
- synapse/vigil-ui
- synapse/main-app
- elara-ide
- azora-ui
- ui

## Step 3: Update App.tsx (Vite Apps)

For each Vite app, update `src/App.tsx`:

```tsx
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

**Apps to update:**
- marketplace-ui
- pay-ui
- cloud-ui
- dev-ui
- enterprise-ui
- learn-ui
- compliance-ui

## Step 4: Update CSS Files

### For Next.js Apps

Copy premium colors to `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Premium Color System - Professional & Modern */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... (copy from app/globals.css) */
  }

  .dark {
    /* ... (copy dark mode colors) */
  }
}
```

### For Vite Apps

Copy premium colors to `src/index.css` or `src/App.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Same as above */
```

## Step 5: Update Tailwind Config

Ensure each app has `tailwind.config.ts` that references premium tokens:

```typescript
import {
  PREMIUM_BREAKPOINTS,
  PREMIUM_COLORS,
  // ... other tokens
} from './lib/design-system/premium-tokens';
```

Or copy from root `tailwind.config.ts`.

## Step 6: Update Package.json

Ensure each app has required dependencies:

```json
{
  "dependencies": {
    "next-themes": "^0.4.6",
    "sonner": "^1.7.4",
    "framer-motion": "^12.23.24",
    "lucide-react": "^0.454.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  }
}
```

## Step 7: Test Each Application

For each app:

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Test locally: `npm run dev`
4. Check for errors
5. Verify dark mode works
6. Verify components render correctly

## Automated Checklist

Use this checklist to track progress:

### Next.js Apps
- [ ] synapse/academy-ui ✅ (Layout updated)
- [ ] synapse/atlas-ui
- [ ] synapse/council-ui
- [ ] synapse/pulse-ui
- [ ] synapse/signal-ui
- [ ] synapse/vault-ui
- [ ] synapse/vigil-ui
- [ ] synapse/main-app
- [ ] elara-ide
- [ ] azora-ui
- [ ] ui

### Vite Apps
- [ ] marketplace-ui
- [ ] pay-ui
- [ ] cloud-ui
- [ ] dev-ui
- [ ] enterprise-ui
- [ ] learn-ui
- [ ] compliance-ui

## Quick Commands

```bash
# Copy all components
npm run update:all-frontends

# Check UI functionality
npm run check:ui

# Build main app
npm run build

# Test specific app
cd synapse/academy-ui && npm run dev
```

## Troubleshooting

### Issue: Components not found
**Solution**: Ensure components are copied and paths are correct in imports

### Issue: ThemeProvider not working
**Solution**: Check that `next-themes` is installed and ThemeProvider wraps the app

### Issue: CSS not applying
**Solution**: Ensure globals.css includes Tailwind directives and premium colors

### Issue: Build errors
**Solution**: Check TypeScript paths in `tsconfig.json` and ensure all dependencies are installed

## Completion Status

**Total Frontends**: 19
**Updated**: 2 (Main App, Synapse Academy)
**Remaining**: 17

## Next Steps

1. Run `npm run update:all-frontends` to copy components
2. Manually update layouts for each app
3. Update CSS files
4. Test each application
5. Deploy to Vercel

