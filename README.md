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

- The app builds with the correct GitHub Pages base path automatically inside GitHub Actions.
- The deployment workflow lives at `/tmp/workspace/4ndynator/swipeorange/.github/workflows/deploy-pages.yml`.
- After making the repository public, enable **Settings → Pages → Source: GitHub Actions** in GitHub.
- Pushes to the `main` branch will then build and deploy the site automatically.

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
