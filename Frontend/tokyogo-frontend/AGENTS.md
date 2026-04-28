# Tokyo GO Frontend — Agent Reference

> Last updated: 2026-04-27
> This file exists so every future agent can ramp up in seconds instead of minutes.

---

## 1. Project Overview

| | |
|---|---|
| **Name** | Tokyo GO — Online Grocery Storefront |
| **Stack** | Next.js 16.2.3 (App Router), TypeScript, Tailwind CSS v4, PostCSS |
| **Fonts** | Plus Jakarta Sans (headlines), Manrope (body) |
| **API Base** | `http://localhost:5001` |
| **Working Dir** | `/Users/appfuxion/Documents/GitHub/Tokyo-OnlineShop/Frontend/tokyogo-frontend` |

**⚠️ CRITICAL:** This is **Next.js 16 (canary)**. APIs, conventions, and file structure differ from Next.js 14/15. Read `node_modules/next/dist/docs/` if unsure. Heed deprecation notices.

---

## 2. Design System (Tokens)

Always reuse these instead of hard-coding one-offs.

### Colors (from `tailwind.config.ts`)
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

### Shadows (consistent palette)
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

---

## 3. API Contracts

### `GET /tokyo/gropup/product`
List all products.
```json
{
  "success": true,
  "message": "Product Success loaded",
  "value": 200,
  "data": [
    {
      "productId": "06ac4019-2d37-4ba4-bc88-7dc580829ec1",
      "productName": "Beras Jiva",
      "status": "AVAILABLE",
      "url": "/images/products/beras-jiva-7bf12e12.jpg",
      "altText": "/images/products/beras-jiva-7bf12e12.jpg",
      "category": "Beras",
      "unitList": [
        {
          "unit": "boxs",
          "convertQuantity": 1,
          "sellPrice": 80000.00,
          "status": "AVAILABLE"
        }
      ]
    }
  ]
}
```
**Key field:** `productId` (NOT `id`). Always use `productId` for URLs and detail fetches.

### `GET /tokyo/gropup/product/{productId}`
Product detail.
```json
{
  "success": true,
  "message": "Product detail success loaded",
  "value": 200,
  "data": {
    "baseWeight": 30,
    "brand": "Indomie",
    "category": "Snack",
    "description": "Cheese Snack from indonesia",
    "imageList": [
      {
        "url": "/images/products/biskuit-ahah-63961c8e.jpg",
        "productName": null,
        "altText": "...",
        "isPrimary": true,
        "slug": null
      }
    ],
    "name": "Biskuit Ahah",
    "sku": "SBA-001",
    "stock": null,
    "subCategory": "Snack",
    "unitList": [
      {
        "id": null,
        "unit": "pcs",
        "convertUnit": null,
        "basePrice": null,
        "sellPrice": 7000.00
      }
    ]
  }
}
```

### `GET /tokyo/gropup/category/list`
Categories.
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "categoryName": "Beras",
      "altText": null,
      "imageUrl": "/image/category/beras.jpg"
    }
  ]
}
```

### `GET /tokyo/gropup/product/arrival`
New arrivals (same product shape as list).

---

## 4. Shared Helpers

These helpers are duplicated across pages. If you change one, consider updating all.

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

---

## 5. Routes & Pages

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Home: hero banner, category slider, product grid, new arrivals slider. Header is sticky with glassmorphism. |
| `/product/[id]` | `app/product/[id]/page.tsx` | Detail page. Fetches by `productId`. Has fallback name-matching if ID fails. **Must use `<Suspense>` if using `useSearchParams()`.** |
| `/product/category` | `app/product/category/page.tsx` | Category list page. Sidebar with hover-to-expand, category images, product grid, search, sort. Reads `?category=Name` query param. |
| `/register` | `app/register/page.tsx` | (not modified by us) |
| `/verify` | `app/verify/page.tsx` | (not modified by us) |

**Routing convention:** App Router requires `page.tsx` (or `layout.tsx`, `loading.tsx`, etc.) inside a folder to create a route. Files like `product_list_page.tsx` are **not routable**.

---

## 6. Page-Specific Notes

### Home (`app/page.tsx`)
- Product cards link to `/product/${product.productId}`
- Category slider uses hover-dim effect config object `HOVER_CONFIG`
- Price badges use `unitMeta` colors: Pcs=emerald, Pack=blue, Box=purple
- `extractProducts()` helper handles both array and `{ data: [...] }` payloads

### Product Detail (`app/product/[id]/page.tsx`)
- Two-strategy fetch: (1) direct ID lookup, (2) fallback name-matching via list API
- Unit selector always shows 3 options: **Piece, Pack, Box**
- Missing units show "Not Available"
- Quantity × price = total shown prominently
- Shows `baseWeight` as package size badge
- No discount pricing, no star ratings (removed per user request)
- Specifications section kept; Product Highlights removed

### Category List (`app/product/category/page.tsx`)
- Sidebar is **collapsible** and **hover-to-expand**
- Width animates: `76px` collapsed → `280px` expanded (`0.45s cubic-bezier`)
- Category buttons show **thumbnail images** from `imageUrl`
- Active category gets green bg + white image ring
- Mobile has chip-style category filters
- Sort options: Default, Price Low→High, Price High→Low, Name

---

## 7. Next.js 16 Quirks & Gotchas

1. **`useSearchParams()` must be wrapped in `<Suspense>`** on Client Components. Build fails otherwise.
2. `params` in Server Components is a **Promise**: `params: Promise<{ slug: string }>` — must `await` it.
3. File names are strict: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`. No custom names.
4. Always check `node_modules/next/dist/docs/` if an API feels off.

---

## 8. Common Patterns

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

---

## 9. Build & Dev

```bash
# Development
npm run dev

# Production build
npx next build

# If routes were renamed / moved, ALWAYS clear cache first:
rm -rf .next && npm run dev
```

---

## 10. Assets

- Product images: served from `public/` root (e.g., `public/beras-jiva-7bf12e12.jpg`)
- Category images: served from `public/image/category/`
- Favicon, icons, SVGs: in `public/`

---

*When in doubt, match the existing code style. Keep changes minimal. Never assume standard Next.js behavior — verify against the local docs.*
