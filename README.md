# Rosie Atelier

Premium bilingual (فارسی RTL / English LTR) platform for **patterns · creators · portfolios · products · education**.

Built with Next.js 15 (App Router), React 19, Tailwind v4 and a token-driven design system.

## Run

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /fa (or /en)
npm run build && npm start
```

## Structure

```
src/
  app/[locale]/            # all routes, locale-prefixed (fa | en)
    page.tsx               # homepage — sections driven by admin config
    patterns/ shop/ artists/ portfolio/ academy/ styles/ spaces/ collections/
    stories/ projects/ custom/ about/ contact/ faq/ returns/ legal/[doc]/
    login/ signup/ account/ favorites/ checkout/ search/ creators/join/ admin/
  app/api/                 # newsletter, contact, admin content
  components/
    ui/                    # Button, Badge/Sku, Tabs/Chips, Modal, Reveal, SpotlightCard,
                           # BentoGrid, GlassPanel, SectionHeader, PageHero, Carousel, States
    layout/                # Header, MegaMenu, StoreDropdown, SearchPalette, CartDrawer, Footer
    cards/                 # PatternCard, ProductCard, ArtistCard, PortfolioCard, EducationCard, StyleCard
    product/               # ColorSwatches, Actions, QuickView, Gallery, FilterBar, BuyBoxes
    portfolio/ profile/ home/ admin/ providers/
  lib/
    i18n/                  # locale types + dictionary
    data/seed.ts           # seed content (patterns, products, artists, portfolios, education…)
    data/store.ts          # local-first content store (data/content.json overrides seed)
    data/queries.ts        # enrich/join helpers
    types.ts               # data model
  app/globals.css          # single source of truth: tokens, typography, motion, primitives
public/
  fonts/iransanse-web/     # Persian font family (see README inside), inter/, instrument-serif/
  images/{hero,patterns,products,portfolios,education,collections,artists}
```

## Design system

- **Tokens** in `globals.css`: `--background` (white), `--surface`, `--foreground`, `--primary` (slate),
  `--accent` (copper), `--blue`, shadows (soft/medium/elevated/glow), radii, motion.
- **Dark mode**: `html[data-theme="dark"]` — a real deep/cinematic theme, toggled in header/footer.
- **Typography**: `font-display` (Instrument Serif) for Latin editorial headlines; **all Persian text
  resolves to `iransanse-web`** via `html[lang=fa]` rules; scale utilities `text-display … text-label`.
- **Motion**: `anim-blur-in`, `anim-fade-up`, `anim-scale-fade`, `[data-reveal]` scroll reveal,
  `img-zoom`, `arrow-shift`, `.spotlight` — all respect `prefers-reduced-motion`.
- **RTL/LTR**: logical properties only (`ms/me/ps/pe/start/end/inset-inline`), `rtl-flip` for icons.

## Admin

Sign in at `/{locale}/login` with the admin account → `/{locale}/admin`.
Manage: homepage sections (order/visibility), hero, categories/styles, pattern/product/artist/
portfolio/education flags & ordering, banners, SEO. Every save is live immediately (all pages are dynamic).

- **Auth**: server-side, HMAC-signed HttpOnly cookie (`src/lib/auth.ts`, `/api/auth/*`).
  - Production: set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
  - Local dev without env vars: any `admin@…` email + ≥4-char password.
  - **Never cached**: `/api/auth/*` and `/api/admin/content` answer with `cache-control: private,
    no-store` + `netlify-cdn-cache-control: no-store` (`src/lib/http.ts`), and the browser sends them
    with `credentials: "same-origin"`. A replayed stale `/api/auth/me` would report "logged out"
    right after login and bounce the admin back to `/login`. `AppProviders` additionally guards the
    session with a version counter (`sessionVersionRef`): a `/me` answer that is older than the
    `login()`/`logout()` that raced it is dropped instead of overwriting the fresh session.
- **Storage** (`src/lib/data/store.ts`, first configured wins):
  1. Upstash Redis — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  2. Vercel Blob — `BLOB_READ_WRITE_TOKEN`
  3. Local file — `data/content.json` (dev / VPS / Docker volume)

## Deploy (Vercel, ~5 minutes)

1. **vercel.com/new** → sign in with GitHub → Import `milpardi42-max/rozbolt`.
2. Framework is auto-detected (Next.js). Leave build settings as-is.
3. **Environment Variables** — add:
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` (any long random string).
4. Click **Deploy** → you get `https://<project>.vercel.app`.
5. **Make admin edits persistent** (Vercel's filesystem is read-only, so pick one):
   - Project → **Storage** → **Create → Upstash Redis** (free) → Connect to project → **Redeploy**; or
   - Project → **Storage** → **Create → Blob** → Connect → **Redeploy**.
6. Optional: **Settings → Domains** → add your own domain.

Every push to the connected branch redeploys automatically. Copy `.env.example` to `.env.local` for local runs.

### Other hosts (VPS / Docker / Liara / etc.)

`npm ci && npm run build && npm start` on Node 20+. Set the same env vars; without Redis/Blob, content persists
to `data/content.json` — keep that directory on a persistent volume.
