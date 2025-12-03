# Supabase Setup Instructions

You provided Supabase credentials. Here's what you need to do:

## Step 1: Get Your Database Password

1. Go to https://supabase.com/dashboard/project/xovhtgwmktbchuizvirq
2. Click on "Settings" (gear icon) in the left sidebar
3. Click on "Database"
4. Under "Connection string", you'll see your password or can reset it

## Step 2: Create .env File

I've created `.env.template` with your Supabase URL and anon key already filled in.

**Copy the template and add your password:**

```powershell
# In PowerShell, run:
cd "C:\Users\Azora Sapiens\Documents\azora"

# Copy template to .env
Copy-Item .env.template .env

# Now edit .env and replace [YOUR-PASSWORD] with your actual database password
# You can use notepad or any text editor:
notepad .env
```

**Or create .env directly with this command** (replace `YOUR_ACTUAL_PASSWORD`):

```powershell
@"
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xovhtgwmktbchuizvirq.supabase.co:5432/postgres"
SUPABASE_URL="https://xovhtgwmktbchuizvirq.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvdmh0Z3dta3RiY2h1aXp2aXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjcwNDYsImV4cCI6MjA3OTg0MzA0Nn0.qvvzOVmWwZcOwZoOs5XoYw340z-JfBOwtBMxbsD-_bc"
JWT_SECRET="azora_dev_secret_2025"
NODE_ENV="development"
"@ | Out-File -FilePath ".env" -Encoding UTF8
```

## Step 3: Test Connection

```powershell
# Generate Prisma Client
npx prisma generate

# Test database connection
npx prisma db pull

# If successful, run migrations
npx prisma migrate dev --name init
```

## Step 4: Verify Setup

```powershell
# Open Prisma Studio to see your database
npx prisma studio
```

---

## Quick Command Summary

Once you have your password, run these in order:

```powershell
# 1. Create .env (replace YOUR_PASSWORD)
# See command above

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Open Prisma Studio
npx prisma studio
```

---

## Troubleshooting

**"Connection refused"**
- Check your password is correct
- Ensure you're using the direct connection URL (port 5432), not pooled (port 6543) for migrations

**"Schema already exists"**
- Your Supabase database might already have tables
- Use `npx prisma db pull` to introspect existing schema
- Or use `npx prisma migrate dev` to apply our schema

**"SSL required"**
- Add `?sslmode=require` to the end of DATABASE_URL if needed

---

Let me know once you've created the .env file with your password, and I'll run the Prisma setup commands!
