# Road Memory - CivicTech Infrastructure Platform

This project contains the Next.js frontend, backend API routes, and Supabase SQL schema for the Road Memory application.

## Prerequisites

1.  **Node.js**: You need to install [Node.js](https://nodejs.org/) to run and build this Next.js application locally.
2.  **Supabase Account**: You need a free account at [Supabase](https://supabase.com/) to host the PostGIS database.
3.  **Twilio Account**: Required for sending SMS/WhatsApp notifications.

## Step 1: Database Setup (Supabase)

1. Create a new project in your Supabase dashboard.
2. Go to the **SQL Editor** in the left sidebar.
3. Open the `supabase-schema.sql` file in this directory, copy all its contents, and run it in the Supabase SQL editor. This will set up all tables and seed data.
4. Go to Project Settings -> API, and copy your `Project URL` and `anon public` key.

## Step 2: Next.js Setup

1. Open a terminal in this directory (`road-memory`).
2. Run `npm install` to install all required dependencies.
3. Rename `.env.local.example` to `.env.local`.
4. Paste your Supabase and Twilio credentials into `.env.local`.
5. Run `npm run dev` to start the development server.
6. Open `http://localhost:3000` in your browser.

## Step 3: Deployment (Vercel & Netlify)

### Vercel Deployment (Primary)
1. Push this code to a GitHub repository.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add the environment variables from your `.env.local` file into the Vercel project settings.
4. Deploy! Vercel natively supports the Next.js API routes used for the Conflict Engine and SLA check.

### Netlify Deployment (Alternative)
1. Import the same repository into [Netlify](https://www.netlify.com/).
2. Netlify will automatically detect it's a Next.js app and install the Next.js runtime.
3. Set the environment variables in the Netlify dashboard.
4. Deploy!

## Architecture Summary
- **Frontend**: Next.js App Router, React Leaflet (Map UI), Tailwind CSS.
- **Backend / Database**: Supabase (PostgreSQL with PostGIS for spatial queries).
- **APIs**:
  - `/api/projects/create`: Conflict Engine (Spatial Overlap & 90-day repeat logic).
  - `/api/complaints/escalate`: Automated SLA tracking.
  - `/api/notifications/notify-residents`: Twilio WhatsApp/SMS integration.
