# LUXORAL Store

Static HTML/CSS/JS storefront upgraded with a real backend on **Vercel + Neon PostgreSQL** (database: `neon-amethyst-cable`).

## Deploy to Vercel

1. Push this repo to GitHub (already done).
2. In [Vercel](https://vercel.com), click **Add New → Project** and import `HayMosh1116/uxorial`.
3. In the project's **Storage** tab, connect your existing Neon database `neon-amethyst-cable`. Vercel injects `POSTGRES_URL` automatically.
4. Deploy. Once live, open `https://<your-app>.vercel.app/api/init-db` once to create all tables and seed the catalog.

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/products` | GET | List all products (supports `?slug=` and `?collection=`) |
| `/api/checkout` | POST | Place order, validate and deduct stock |
| `/api/admin` | GET | Dashboard stats, products, recent orders |
| `/api/admin` | PATCH | Update stock, price, or product active flag |
| `/api/init-db` | GET | One-time schema + seed setup |

## Files

- `schema.sql` — database schema and seed data
- `api/` — serverless backend functions
- `js/store.js` — frontend API client
- `index.html`, `shop.html`, etc. — existing storefront (unchanged design)
