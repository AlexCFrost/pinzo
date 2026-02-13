# Pinzo - Smart Bookmark Manager

A modern, real-time bookmark manager built with Next.js 16, Supabase, and Google OAuth.

## Problems Faced & Solutions

### 1. Real-time Updates Not Working (Postgres Changes)

**Problem:**  
Initially implemented real-time sync using Supabase's `postgres_changes` subscription. The subscription connected successfully but never received any events when bookmarks were added or deleted. The UI showed updates only after manual page refresh.

**Investigation:**
- Verified RLS policies weren't blocking the subscription
- Confirmed the channel connected successfully
- Tested with simplified queries - still no events received
- Database changes were happening but not triggering real-time events

**Solution:**  
Switched from `postgres_changes` to Supabase **Broadcast** with a custom PostgreSQL trigger. Created a database trigger function that calls `realtime.send()` after any INSERT or DELETE on the bookmarks table. This proved much more reliable:

```sql
CREATE OR REPLACE FUNCTION broadcast_bookmark_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.send(
    json_build_object(
      'event', TG_OP,
      'table', TG_TABLE_NAME,
      'data', row_to_json(COALESCE(NEW, OLD))
    )::jsonb,
    'bookmark_changes',
    null
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

The broadcast approach works consistently and reliably across all tabs.

### 2. Hydration Mismatch Error

**Problem:**  
React hydration errors occurred when displaying bookmark timestamps. The error message: "Text content does not match. Server: ... Client: ...". This happened because date formatting on the server produced different output than on the client due to timezone differences.

**Root Cause:**
Server-side rendering formats dates in UTC, while client-side JavaScript formats them in the user's local timezone, causing a mismatch between server HTML and client React tree.

**Solution:**  
Implemented a `mounted` state that starts as `false` and becomes `true` after the component mounts on the client:

```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

// Only render dates after mounting
{mounted && <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>}
```

This ensures dates are only rendered client-side, eliminating the hydration mismatch.

### 3. Database Trigger Configuration

**Problem:**  
After creating the broadcast trigger, real-time updates still weren't working. The trigger function was created successfully but wasn't firing.

**Root Cause:**
The trigger was defined but not actually attached to the bookmarks table's INSERT and DELETE events.

**Solution:**  
Created the trigger attachment with proper event configuration:

```sql
CREATE TRIGGER bookmark_changes_trigger
AFTER INSERT OR DELETE ON bookmarks
FOR EACH ROW
EXECUTE FUNCTION broadcast_bookmark_changes();
```

The trigger now fires automatically on every bookmark change and broadcasts to all connected clients.

## Tech Stack

- **Frontend:** Next.js 16.1.6 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Authentication, Real-time)
- **Authentication:** Google OAuth via Supabase Auth
- **Deployment:** Vercel
- **Icons:** Material Icons
- **Package Manager:** pnpm

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback handler
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard server component
│   │   ├── globals.css               # Global styles and theme system
│   │   ├── layout.tsx                # Root layout with ThemeProvider
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── DashboardClient.tsx       # Main dashboard with real-time sync
│   │   ├── Logo.tsx                  # Custom SVG logo
│   │   ├── ThemeProvider.tsx         # Theme context
│   │   └── ThemeToggle.tsx           # Theme toggle button
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       └── server.ts             # Server Supabase client
│   └── middleware.ts                 # Auth protection middleware
├── broadcast-trigger.sql             # Real-time broadcast trigger
├── supabase-setup.sql                # Database schema and RLS
├── tailwind.config.ts                # Tailwind configuration
└── package.json
```

## Features

- **Google OAuth Authentication** - Secure sign-in with Google (no email/password)
- **Real-time Sync** - Bookmarks update instantly across all open tabs using Supabase Broadcast
- **Private Bookmarks** - Each user's bookmarks are completely private with Row Level Security
- **Theme Toggle** - Seamless light/dark mode with persistent preference
- **Modern UI** - Glass-morphism design with custom branding and smooth animations
- **Responsive Design** - Works beautifully on desktop and mobile devices

