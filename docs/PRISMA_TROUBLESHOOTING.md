# Prisma Setup Troubleshooting

## Current Issue

Prisma commands are failing with a truncated error message about DATABASE_URL.

## What's Been Done

1. ✅ Created `.env` file with Supabase credentials
2. ✅ Fixed Prisma schema (added User relations)
3. ✅ Removed conflicting `prisma.config.ts`

## Manual Steps to Try

### Step 1: Verify .env File
```powershell
cd "C:\Users\Azora Sapiens\Documents\azora"
Get-Content .env
```

Expected content:
```
DATABASE_URL=postgresql://postgres:Azorabase1@db.xovhtgwmktbchuizvirq.supabase.co:5432/postgres
SUPABASE_URL=https://xovhtgwmktbchuizvirq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=azora_dev_secret_2025
NODE_ENV=development
```

### Step 2: Get Full Error Message
```powershell
npx prisma validate
```

### Step 3: Try with Explicit Environment Variable
```powershell
$env:DATABASE_URL="postgresql://postgres:Azorabase1@db.xovhtgwmktbchuizvirq.supabase.co:5432/postgres"
npx prisma generate
```

### Step 4: Alternative - URL Encode Password
If the `@` symbol in the password is causing issues:
```powershell
# URL-encoded password: Azorabase1@ becomes Azorabase1%40
$env:DATABASE_URL="postgresql://postgres:Azorabase1%40@db.xovhtgwmktbchuizvirq.supabase.co:5432/postgres"
npx prisma generate
```

## Common Issues

1. **Encoding**: .env file must be UTF-8 without BOM
2. **Special Characters**: `@` in password may need URL encoding (`%40`)
3. **Quotes**: DATABASE_URL value should NOT have quotes in .env file
4. **Line Endings**: Use Unix-style (LF) not Windows (CRLF)

## If All Else Fails

Create .env manually in notepad:
1. Open Notepad
2. Paste:
```
DATABASE_URL=postgresql://postgres:Azorabase1%40@db.xovhtgwmktbchuizvirq.supabase.co:5432/postgres
SUPABASE_URL=https://xovhtgwmktbchuizvirq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvdmh0Z3dta3RiY2h1aXp2aXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjcwNDYsImV4cCI6MjA3OTg0MzA0Nn0.qvvzOVmWwZcOwZoOs5XoYw340z-JfBOwtBMxbsD-_bc
JWT_SECRET=azora_dev_secret_2025
NODE_ENV=development
```
3. Save As → `.env` (with the dot)
4. Encoding: UTF-8
5. Save in: `C:\Users\Azora Sapiens\Documents\azora`

Then try: `npx prisma generate`
