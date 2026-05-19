# ✦ Genshin Build Tracker — Setup Guide

## Quick Start (Local)

```bash
npm install
npm run dev
```

Then open http://localhost:5173 — the app works immediately using localStorage. No Supabase needed to get started.

## Deploy to GitHub Pages

### Step 1: Create a GitHub repo
- Go to github.com → New repository
- Name it `genshin-tracker` (or anything you like)
- Push this project to it

### Step 2: Enable GitHub Pages
- Go to your repo → Settings → Pages
- Source: **GitHub Actions**
- The workflow at `.github/workflows/deploy.yml` will auto-deploy on every push to `main`

### Step 3: (Optional) Connect Supabase for cross-device sync
- Go to [supabase.com](https://supabase.com) → your project → Settings → API
- Copy your **Project URL** and **anon public key**
- In your GitHub repo → Settings → Secrets → Actions, add:
  - `VITE_SUPABASE_URL` = your project URL
  - `VITE_SUPABASE_ANON_KEY` = your anon key
- Run the SQL in `supabase/schema.sql` in your Supabase SQL editor
- Re-deploy — data will now sync across all devices

### Step 4: (Optional) Local Supabase dev
- Copy `.env.example` → `.env`
- Fill in your Supabase credentials
- `npm run dev`

## Notes
- Without Supabase: all data (checkboxes, notes, todos) saves to browser localStorage
- With Supabase: data syncs across devices (phone + desktop)
- Sucrose's talent books: listed as Resistance — please verify in-game
