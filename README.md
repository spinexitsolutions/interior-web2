# Aangan Studio: furniture & interior website + CMS

A Next.js 16 site for a furniture house / interior design studio, with a full admin panel.
Every page, section, product, project, testimonial, colour, font and menu link is editable from `/admin`.

## Run it

```bash
npm install
cp .env.example .env.local   # set AUTH_SECRET
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin (first login `admin@aangan.studio` / `admin123`, change it in Settings → Account)

On first run the CMS writes demo content to `data/db.json`. Uploaded files go to `data/uploads/`.
Admin → Settings → "Restore demo content" resets everything.

## What's inside

**Website**
- Kinetic hero with a parallax image collage and rotating badge
- Smooth scrolling (Lenis) and GSAP ScrollTrigger choreography: pinned horizontal gallery, image that expands to full screen, sticky stacking project cards, word-by-word statement reveal, scroll-velocity marquee, counters, process timeline
- Shop with category filters and sorting, product pages with finishes and an enquiry flow
- Projects index (hover-preview list or grid) and project case studies
- Contact form that saves enquiries to the admin inbox
- Light / dark mode (auto, or forced from the admin), intro preloader, film grain, optional custom cursor
- Sans-serif typography: display + body fonts are chosen in the admin from a curated Google Fonts list

**Admin (`/admin`)**
- Page builder: add, reorder, duplicate, hide or delete 18 section types on any page; create new pages
- Products, categories, projects, testimonials (full CRUD)
- Media library with drag-and-drop upload
- Inquiries inbox
- Settings: brand, colour palette, fonts, heading weight & spacing, corner radius, navigation, contact details, socials, footer, SEO, experience toggles, admin login

## Project layout

```
src/app/(site)/        public pages
src/app/admin/         admin panel + server actions
src/components/sections/  every CMS section type
src/components/admin/  schema-driven form builder
src/lib/schemas.ts     field definitions for settings, collections and sections
src/lib/seed.ts        demo content
src/lib/db.ts          JSON file store
```

To add a new section type: add its fields to `SECTIONS` in `src/lib/schemas.ts`, build the component in `src/components/sections/`, and map it in `render.tsx`. The admin form appears automatically.

## Deploying

The CMS stores content on disk, so deploy to a host with a persistent filesystem (a VPS, Docker with a volume, Railway, Render, Fly.io) and set `DATA_DIR` to the persistent path.
Serverless hosts like Vercel have a read-only filesystem: admin edits would not persist there without swapping `src/lib/db.ts` for a database.

```bash
npm run build
AUTH_SECRET=... DATA_DIR=/data npm start
```

Images in the demo come from Unsplash URLs; replace them from the admin or upload your own.
