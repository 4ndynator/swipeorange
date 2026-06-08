# swipeorange

Local-only, swipe-friendly interactive menu web app MVP.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

- Publishing the repository root directly does not work for this app because GitHub Pages serves the source `index.html`, which points to `/src/main.tsx` instead of the built `dist` assets.
- The deployment workflow lives at `.github/workflows/deploy-pages.yml`.
- In GitHub, set **Settings → Pages → Source** to **GitHub Actions** so the workflow deploys the built `dist` output.
- Pushes to the `main` branch will then lint, build, and deploy the site automatically.
- The Vite build uses relative asset paths so the deployed app works correctly under the GitHub Pages project URL.

## Lint

```bash
npm run lint
```

## MVP capabilities

- Admin mode and Customer mode on one device
- Local persistence with IndexedDB and local preferences in localStorage
- Category and item management (create/edit/delete/reorder/duplicate)
- Item variants and modifiers with price adjustments
- Promotions, visibility, and availability settings
- Multi-language content with fallback to default language
- Customer search, category filter, swipe/tap browsing, and item details
- JSON export/import backup flow with validation and overwrite confirmation
- Demo data bootstrap and destructive action confirmations
