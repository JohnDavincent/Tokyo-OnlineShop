# Tokyo GO Frontend Shop Skill

> Reusable skill for working with the Tokyo GO Online Grocery Storefront

## Project Identity

| | |
|---|---|
| **Name** | Tokyo GO — Online Grocery Storefront |
| **Stack** | Next.js 16.2.3 (App Router), TypeScript, Tailwind CSS v4, PostCSS |
| **Fonts** | Plus Jakarta Sans (headlines), Manrope (body) |
| **API Base** | `http://localhost:5001` |

## Critical Stack Notes

- **Next.js 16 (canary)**: APIs, conventions, and file structure differ from Next.js 14/15. Read `node_modules/next/dist/docs/` if unsure.
- **`useSearchParams()` must be wrapped in `<Suspense>`** on Client Components. Build fails otherwise.
- `params` in Server Components is a **Promise**: `params: Promise<{ slug: string }>` — must `await` it.
- File names are strict: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`. No custom names.

## Design System Tokens

### Colors
```
primary:        #006941   (deep green — main CTA, accents)
primary-dim:    #005c38   (hover state)
background:     #f6f8f5   (page background)
surface:        #d9ffed   (mint highlights)
primary-fixed:  #7bfeb8   (light green badges)
tertiary:       #feaa00   (amber/gold accent)
error:          #b31b25
on-surface:     #003627   (dark green text)
outline:        #4d816d
```

### Typography
- Headlines: `font-headline` → Plus Jakarta Sans, `font-extrabold`, `tracking-[-0.04em]`
- Body: `font-body` → Manrope
- Labels: `text-[0.65rem] font-bold uppercase tracking-[0.16em]`

### Shadows
```
shadow-[0_8px_30px_rgba(0,39,25,0.06)]   // cards
shadow-[0_16px_40px_rgba(0,39,25,0.08)]  // elevated cards
shadow-[0_24px_60px_rgba(0,45,30,0.12)]  // hero banners
shadow-[0_4px_16px_rgba(0,105,65,0.22)]  // primary buttons
```

### Border Radius
- Cards: `rounded-[20px]` to `rounded-[32px]`
- Buttons: `rounded-2xl` or `rounded-full`
- Inputs: `rounded-2xl` or `rounded-xl`

## API Endpoints

### List Products
`GET /tokyo/gropup/product`
Response: `{ success, message, value, data: Product[] }`

### Product Detail
`GET /tokyo/gropup/product/{productId}`
Response: `{ success, message, value, data: ProductDetail }`

### Categories
`GET /tokyo/gropup/category/list`
Response: `{ success, data: Category[] }`

### New Arrivals
`GET /tokyo/gropup/product/arrival`
Response: Same shape as product list

## Key Data Fields

- **`productId`** (NOT `id`) — always use for URLs and detail fetches
- `productName` / `name` — list uses `productName`, detail uses `name`
- `unitList[].unit` — normalize with: Pcs, Pack, Box
- `unitList[].sellPrice` — display price
- `imageList[].url` — detail page images
- `url` / `imageUrl` — list page images

## Shared Helpers

```ts
const API_BASE_URL = "http://localhost:5001";

function resolveProductImage(url?: string) {
  if (!url) return /* no-image svg */;
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/${filename}`;
}

function resolveCategoryImage(url?: string | null) {
  if (!url) return /* no-image svg */;
  if (url.startsWith("data:")) return url;
  const filename = url.split("/").pop();
  return `/image/category/${filename}`;
}

function normalizeUnit(rawUnit: string) {
  const lo = rawUnit.toLowerCase();
  if (lo.includes("pcs") || lo.includes("piece")) return "Pcs";
  if (lo.includes("pack") || lo.includes("pax")) return "Pack";
  if (lo.includes("box")) return "Box";
  return rawUnit;
}
```

## Common UI Patterns

### Loading Spinner
```tsx
<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
```

### Glass Header
```tsx
<header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl">
```

### Card Hover
```tsx
className="... transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,39,25,0.1)]"
```

### Primary Button
```tsx
className="rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,105,65,0.22)] hover:-translate-y-0.5 hover:bg-primary-dim transition-all"
```

## Routes

| Route | File |
|---|---|
| `/` | `app/page.tsx` |
| `/product/[id]` | `app/product/[id]/page.tsx` |
| `/product/category` | `app/product/category/page.tsx` |
| `/register` | `app/register/page.tsx` |
| `/verify` | `app/verify/page.tsx` |

## Assets

- Product images: `public/` root (e.g., `public/beras-jiva-7bf12e12.jpg`)
- Category images: `public/image/category/`
- Favicon, icons, SVGs: in `public/`

## Build Commands

```bash
npm run dev          # Development
npx next build       # Production build
rm -rf .next && npm run dev   # Clear cache (after route changes)
```
