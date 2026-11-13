# art-compare

React to 30 public-domain paintings, see what your taste leans toward, and compare with someone else in a shared room.

## Run

```
npm install
npm run dev
```

Without configuration the app runs in demo mode: rooms live only in the current browser.

## Shared rooms (Supabase)

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Add `art_compare` under Project Settings -> API -> Exposed schemas.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.

There are no accounts. Anyone with the anon key can read and write the one `art_compare.participants` table, so keep it to throwaway data.

## Deploy

`npm run build` produces a static site in `dist/`. Set the three `VITE_` variables in the host's build settings.

Images are from the Art Institute of Chicago open-access collection.
