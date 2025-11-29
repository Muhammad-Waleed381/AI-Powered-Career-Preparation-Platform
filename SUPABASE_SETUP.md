# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Visit https://supabase.com
2. Click "Start your project" or "Sign In"
3. Sign in with GitHub (recommended)
4. Click "New Project"
5. Fill in:
   - **Name**: `ai-career-platform` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
6. Click "Create new project"
7. Wait 2-3 minutes for project to be ready

## Step 2: Get API Keys

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` key (safe for browser)
     - `service_role` key (keep secret, server-only)

## Step 3: Add to Environment

Copy these values to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...
```

## Step 4: Run Database Migrations

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" button
5. Verify all tables were created in "Table Editor"

## Step 5: Verify Setup

Run the test:
```bash
npm run test:db
```

This will verify:
- ✅ Connection to Supabase
- ✅ All tables exist
- ✅ Can insert and read data

---

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the schema.sql in Step 4
- Check you're in the correct project

### Error: "Invalid API key"
- Double-check you copied the full key
- Make sure you're using `anon` key for NEXT_PUBLIC_SUPABASE_ANON_KEY
- Make sure you're using `service_role` key for SUPABASE_SERVICE_ROLE_KEY

### Error: "Failed to connect"
- Check your internet connection
- Verify the SUPABASE_URL is correct
- Make sure project is fully initialized (not "Setting up...")

---

## Next Steps

After setup is complete:
1. ✅ Tables created
2. ✅ API keys configured
3. 🔄 Update API route to save data
4. 🔄 Test end-to-end workflow
