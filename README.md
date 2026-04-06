# Welcome to your Lovable project

## Project info

**URL**: [https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID)

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Sync iCloud Calendar into this app

You can import and keep iCloud events in sync with:

```sh
npm run sync:ical
```

Or use the in-app **Sync iCloud** button (manual one-click sync, no cron).

### 1) Add your iCloud ICS URL to `.env`

Add this line to your `.env` file:

```sh
ICAL_URL="https://pXX-caldav.icloud.com/published/2/....ics"
VITE_ICAL_URL="https://pXX-caldav.icloud.com/published/2/....ics"
```

Optional settings:

```sh
ICAL_SYNC_COLOR="purple"
ICAL_SYNC_LOOKAHEAD_DAYS="365"
ICAL_SYNC_LOOKBACK_DAYS="30"
```

### 2) Apply the new Supabase migration

This repo includes a migration that adds sync-tracking fields to `calendar_events`.
Apply migrations using your normal Supabase workflow before first sync.

TODO (if sync fails with "column calendar_events.external_uid does not exist"):
Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE public.calendar_events
ADD COLUMN source TEXT,
ADD COLUMN external_uid TEXT;

CREATE UNIQUE INDEX calendar_events_source_external_uid_idx
ON public.calendar_events (source, external_uid)
WHERE source IS NOT NULL AND external_uid IS NOT NULL;
```

### 3) Run the sync command whenever needed

Run `npm run sync:ical` manually, or schedule it with `cron`/`launchd` on macOS if you want automatic refresh.