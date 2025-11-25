# Build Issues - Azora Ecosystem

**Date**: 2025-11-26  
**Status**: Documenting build failures for resolution

## Application Build Issues

### azora-sapiens ❌

**Status**: Build failed  
**Framework**: Next.js 16.0.3 (Turbopack)  
**Error Count**: 79 errors

#### Primary Issues

1. **TailwindCSS PostCSS Plugin Issue**
   - **Error**: `tailwindcss` being used directly as PostCSS plugin
   - **Solution Required**: Install `@tailwindcss/postcss` and update PostCSS configuration
   - **File**: `apps/azora-sapiens/app/globals.css`
   - **Impact**: Blocks entire build

2. **Module Resolution Error**
   - **Error**: `Module not found: Can't resolve './event-bus'`
   - **File**: `packages/shared-design/telemetry.ts:9:1`
   - **Impact**: Missing dependency

#### Recommended Fixes

```bash
# Fix 1: Install TailwindCSS PostCSS plugin
cd apps/azora-sapiens
npm install @tailwindcss/postcss

# Fix 2: Update postcss.config.js
# Change from:
# plugins: { tailwindcss: {} }
# To:
# plugins: { '@tailwindcss/postcss': {} }

# Fix 3: Fix event-bus import
# Check packages/shared-design/telemetry.ts
# Ensure ./event-bus.ts exists or update import path
```

### azora-buildspaces ❌

**Status**: Build failed  
**Framework**: Next.js 14.2.3  
**Error Count**: 3 module resolution errors

#### Primary Issues

1. **Missing Shared Auth Middleware**
   - **Error**: `Module not found: Can't resolve '@azora/shared-auth/middleware'`
   - **File**: `packages/shared-design/api-routes.ts`
   - **Impact**: Shared package dependency missing

2. **Event Bus Module Missing**
   - **Error**: `Module not found: Can't resolve './event-bus'`
   - **File**: `packages/shared-design/telemetry.ts`
   - **Impact**: Same issue as azora-sapiens

3. **SWC Dependencies**
   - **Warning**: Lockfile missing swc dependencies
   - **Impact**: Performance degradation

#### Recommended Fixes

```bash
# Fix 1: Install shared-auth package
cd packages/shared-auth
npm install
npm run build

# Fix 2: Fix event-bus import
# Check packages/shared-design/telemetry.ts

# Fix 3: Update lockfile
cd apps/azora-buildspaces
npm install
```

### web ❌

**Status**: Build failed  
**Framework**: Vite  
**Error**: Missing Vite plugin

#### Primary Issues

1. **Missing Vite Legacy Plugin**
   - **Error**: `Cannot find module '@vitejs/plugin-legacy'`
   - **File**: `apps/web/vite.config.js:37:36`
   - **Impact**: Blocks entire build

2. **CJS Deprecation Warning**
   - **Warning**: CJS build of Vite's Node API is deprecated
   - **Impact**: Future compatibility issue

#### Recommended Fixes

```bash
# Fix 1: Install missing plugin
cd apps/web
npm install @vitejs/plugin-legacy

# Fix 2: Update to ESM (optional, for future)
# Convert vite.config.js to vite.config.mjs
# Use ESM imports
```

### azora-master ⏳

**Status**: Build testing  
**Framework**: TBD

## Common Build Issues Identified

### 1. TailwindCSS v4 Migration
**Affected Apps**: azora-sapiens (confirmed), likely others  
**Root Cause**: TailwindCSS v4 moved PostCSS plugin to separate package  
**Fix**: Install `@tailwindcss/postcss` in all affected apps

### 2. Module Resolution
**Affected**: packages/shared-design  
**Issue**: Missing or incorrect import paths  
**Fix**: Verify all module exports and imports

## Build Configuration Review Needed

### PostCSS Configuration
All apps using TailwindCSS need:
```javascript
// postcss.config.js or postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### Package Dependencies
Check all apps for:
- `@tailwindcss/postcss` installation
- Correct TailwindCSS version compatibility
- Shared package dependencies

## Next Steps

### Immediate
1. Fix azora-sapiens TailwindCSS configuration
2. Fix event-bus module resolution
3. Verify azora-buildspaces build
4. Test azora-master and web builds

### Short Term
1. Audit all apps for TailwindCSS v4 compatibility
2. Update all PostCSS configurations
3. Verify shared package exports
4. Re-run all builds

### Documentation
- [ ] Create TAILWIND-MIGRATION.md guide
- [ ] Update build documentation
- [ ] Add troubleshooting guide

---

**Priority**: High  
**Blocking**: Browser testing  
**Owner**: Development team
