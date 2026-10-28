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
- Black & tan palette with Unbounded display type, cream colour-block sections, film grain
- Signature homepage sections:
  - word-mask hero: the brand name is a window onto a room; scrolling zooms through the letters into it
  - manifesto paragraph with photos that open between the words
  - "Shop the room" photo with clickable product markers
  - accordion photo strips for collections
  - blinds reveal of a featured project
  - 3D product ring that turns as you scroll
  - floor plan that draws itself while the process steps advance, then reveals the finished room
  - draggable paper testimonial cards
  - cursor photo trail closing section
- Lenis smooth scrolling, GSAP ScrollTrigger, curtain page transitions, full-screen menu
- Shop with filters, product pages, projects index and case studies, contact form into the admin inbox
- All earlier section types (hero collage, marquee, horizontal gallery, stacked cards, stats, FAQ...) remain available in the page builder

**Admin (`/admin`)**
- Page builder: add, reorder, duplicate, hide or delete 27 section types on any page; create new pages
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

## Instagram reel

Record a vertical 1080x1920 MP4 of the website (public pages only, never the admin):

```bash
npx playwright install chromium   # once
npm run reel
```

The script starts the site, plays the preloader, zooms through the hero, taps "Shop the room" markers, scrolls the blinds and floor plan, throws testimonial cards, opens the menu and visits the shop and a product. The video is saved to `reel/aangan-reel.mp4` (about 60 seconds, 30 fps).
Options: `--fps=60` for extra smoothness, `--url=https://your-live-site.com` to record a deployed site.
Run it on a machine with internet access so the Unsplash photos load.
