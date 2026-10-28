// Field schemas drive every admin form: settings, collections and page sections.
// Shared by server and client, so keep this file free of Node imports.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "color"
  | "image"
  | "images"
  | "select"
  | "toggle"
  | "tags"
  | "list"
  | "group"
  | "ref"
  | "refMulti"
  | "font";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  fields?: Field[];
  collection?: "products" | "categories" | "projects" | "testimonials";
  itemLabel?: string;
  wide?: boolean;
};

// Google Fonts weight ranges so the CSS API request is always valid.
export const FONT_AXES: Record<string, [number, number]> = {
  "Bricolage Grotesque": [200, 800],
  Syne: [400, 800],
  Unbounded: [200, 900],
  "Space Grotesk": [300, 700],
  Manrope: [200, 800],
  "Inter Tight": [100, 900],
  Archivo: [100, 900],
  "Familjen Grotesk": [400, 700],
  "Schibsted Grotesk": [400, 900],
  "Instrument Sans": [400, 700],
  Sora: [100, 800],
  Outfit: [100, 900],
  "Plus Jakarta Sans": [200, 800],
  "DM Sans": [100, 1000],
  "Hanken Grotesk": [100, 900],
  Onest: [100, 900],
  Geologica: [100, 900],
  Figtree: [300, 900],
};

export const FONT_OPTIONS = Object.keys(FONT_AXES).map((f) => ({ label: f, value: f }));

export function googleFontsUrl(fonts: string[]) {
  const families = [...new Set(fonts.filter((f) => FONT_AXES[f]))].map((f) => {
    const [a, b] = FONT_AXES[f];
    return `family=${f.replace(/ /g, "+")}:wght@${a}..${b}`;
  });
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

const TONE: Field = {
  name: "tone",
  label: "Section colour",
  type: "select",
  options: [
    { label: "Light (background)", value: "light" },
    { label: "Surface (soft)", value: "surface" },
    { label: "Dark", value: "dark" },
    { label: "Accent", value: "accent" },
  ],
};

const LINK_FIELDS: Field[] = [
  { name: "label", label: "Label", type: "text" },
  { name: "href", label: "Link", type: "text", placeholder: "/shop" },
];

/* -------------------------------------------------------------------------- */
/*                                  Settings                                  */
/* -------------------------------------------------------------------------- */

export const SETTINGS_SCHEMA: Field[] = [
  {
    name: "brand",
    label: "Brand",
    type: "group",
    fields: [
      { name: "name", label: "Brand name", type: "text" },
      { name: "logoText", label: "Logo text", type: "text", help: "Shown in the header when no logo image is set." },
      { name: "logoImage", label: "Logo image (optional)", type: "image" },
      { name: "tagline", label: "Tagline", type: "text" },
      { name: "currency", label: "Currency symbol", type: "text", placeholder: "₹" },
    ],
  },
  {
    name: "theme",
    label: "Theme: colours & typography",
    type: "group",
    fields: [
      {
        name: "mode",
        label: "Colour mode",
        type: "select",
        options: [
          { label: "Auto (follow visitor's device)", value: "auto" },
          { label: "Always light", value: "light" },
          { label: "Always dark", value: "dark" },
        ],
      },
      { name: "bg", label: "Background", type: "color" },
      { name: "surface", label: "Surface", type: "color" },
      { name: "ink", label: "Text / ink", type: "color" },
      { name: "muted", label: "Muted text", type: "color" },
      { name: "accent", label: "Accent", type: "color" },
      { name: "dark", label: "Dark sections", type: "color" },
      { name: "onDark", label: "Text on dark", type: "color" },
      { name: "displayFont", label: "Display font (headings)", type: "font" },
      { name: "bodyFont", label: "Body font", type: "font" },
      {
        name: "displayWeight",
        label: "Heading weight",
        type: "select",
        options: ["300", "400", "500", "600", "700", "800"].map((v) => ({ label: v, value: v })),
      },
      { name: "displayTracking", label: "Heading letter-spacing (em, e.g. -0.04)", type: "number" },
      { name: "radius", label: "Corner radius (px)", type: "number" },
    ],
  },
  { name: "nav", label: "Navigation links", type: "list", itemLabel: "label", fields: LINK_FIELDS },
  { name: "navCta", label: "Header button", type: "group", fields: LINK_FIELDS },
  {
    name: "contact",
    label: "Contact details",
    type: "group",
    fields: [
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "hours", label: "Opening hours", type: "text" },
    ],
  },
  { name: "socials", label: "Social links", type: "list", itemLabel: "label", fields: LINK_FIELDS },
  {
    name: "footer",
    label: "Footer",
    type: "group",
    fields: [
      { name: "bigText", label: "Giant footer word", type: "text" },
      { name: "note", label: "Footer note", type: "textarea" },
      { name: "copyright", label: "Copyright line", type: "text" },
    ],
  },
  {
    name: "seo",
    label: "SEO defaults",
    type: "group",
    fields: [
      { name: "title", label: "Site title", type: "text" },
      { name: "description", label: "Meta description", type: "textarea" },
      { name: "ogImage", label: "Share image", type: "image" },
    ],
  },
  {
    name: "features",
    label: "Experience",
    type: "group",
    fields: [
      { name: "preloader", label: "Intro preloader", type: "toggle" },
      { name: "customCursor", label: "Custom cursor", type: "toggle" },
      { name: "smoothScroll", label: "Smooth scrolling", type: "toggle" },
      { name: "grain", label: "Film grain overlay", type: "toggle" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                 Collections                                */
/* -------------------------------------------------------------------------- */

export const COLLECTIONS: Record<
  string,
  { label: string; singular: string; titleField: string; imageField?: string; subtitleField?: string; fields: Field[] }
> = {
  products: {
    label: "Products",
    singular: "Product",
    titleField: "name",
    imageField: "images",
    subtitleField: "category",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "slug", label: "URL slug", type: "text", help: "Leave empty to generate from the name." },
      { name: "category", label: "Category", type: "ref", collection: "categories" },
      { name: "price", label: "Price", type: "number" },
      { name: "compareAt", label: "Compare-at price (optional)", type: "number" },
      { name: "shortDescription", label: "Short description", type: "textarea", wide: true },
      { name: "description", label: "Full description", type: "textarea", wide: true },
      { name: "images", label: "Images (first one is the cover, second shows on hover)", type: "images", wide: true },
      { name: "materials", label: "Materials", type: "tags" },
      { name: "dimensions", label: "Dimensions", type: "text", placeholder: "W 220 × D 95 × H 72 cm" },
      {
        name: "colors",
        label: "Finishes / colours",
        type: "list",
        itemLabel: "name",
        fields: [
          { name: "name", label: "Name", type: "text" },
          { name: "hex", label: "Colour", type: "color" },
        ],
      },
      { name: "featured", label: "Featured", type: "toggle" },
      { name: "inStock", label: "In stock", type: "toggle" },
      { name: "order", label: "Sort order", type: "number" },
    ],
  },
  categories: {
    label: "Categories",
    singular: "Category",
    titleField: "name",
    imageField: "image",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "slug", label: "URL slug", type: "text" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "image", label: "Image", type: "image", wide: true },
      { name: "order", label: "Sort order", type: "number" },
    ],
  },
  projects: {
    label: "Projects",
    singular: "Project",
    titleField: "title",
    imageField: "cover",
    subtitleField: "location",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "slug", label: "URL slug", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "year", label: "Year", type: "text" },
      { name: "type", label: "Type", type: "text", placeholder: "Residential" },
      { name: "area", label: "Area", type: "text", placeholder: "3,200 sq ft" },
      { name: "cover", label: "Cover image", type: "image", wide: true },
      { name: "gallery", label: "Gallery", type: "images", wide: true },
      { name: "summary", label: "Summary", type: "textarea", wide: true },
      { name: "body", label: "Story (blank line = new paragraph)", type: "textarea", wide: true },
      { name: "featured", label: "Featured", type: "toggle" },
      { name: "order", label: "Sort order", type: "number" },
    ],
  },
  testimonials: {
    label: "Testimonials",
    singular: "Testimonial",
    titleField: "name",
    imageField: "avatar",
    subtitleField: "role",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", wide: true },
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role / location", type: "text" },
      { name: "avatar", label: "Photo", type: "image" },
      { name: "order", label: "Sort order", type: "number" },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Sections                                  */
/* -------------------------------------------------------------------------- */

export type SectionDef = { label: string; description: string; fields: Field[] };

export const SECTIONS: Record<string, SectionDef> = {
  hero: {
    label: "Hero: kinetic collage",
    description: "Giant headline with a parallax image collage and spinning badge.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "headline", label: "Headline (one line per row, wrap a word in *stars* to highlight it)", type: "textarea", wide: true },
      { name: "subtext", label: "Sub text", type: "textarea", wide: true },
      { name: "primary", label: "Primary button", type: "group", fields: LINK_FIELDS },
      { name: "secondary", label: "Secondary link", type: "group", fields: LINK_FIELDS },
      { name: "images", label: "Collage images (3 work best)", type: "images", wide: true },
      { name: "badge", label: "Rotating badge text", type: "text" },
    ],
  },
  expandImage: {
    label: "Expanding image",
    description: "A framed image that grows to full-screen as you scroll.",
    fields: [
      { name: "image", label: "Image", type: "image", wide: true },
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Overlay title", type: "text" },
      { name: "caption", label: "Caption", type: "text" },
    ],
  },
  marquee: {
    label: "Marquee",
    description: "Oversized scrolling words that react to scroll speed.",
    fields: [
      { name: "items", label: "Words", type: "tags", wide: true },
      { name: "outline", label: "Outlined text", type: "toggle" },
      { name: "speed", label: "Speed (seconds per loop)", type: "number" },
      TONE,
    ],
  },
  statement: {
    label: "Statement",
    description: "A big paragraph that lights up word by word on scroll.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "text", label: "Statement", type: "textarea", wide: true },
      { name: "signature", label: "Signature line", type: "text" },
      { name: "images", label: "Small floating images (optional, 2)", type: "images", wide: true },
      TONE,
    ],
  },
  services: {
    label: "Services list",
    description: "Big rows with a cursor-following image preview on hover.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      {
        name: "items",
        label: "Services",
        type: "list",
        itemLabel: "title",
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "tags", label: "Tags", type: "tags" },
          { name: "image", label: "Hover image", type: "image" },
          { name: "href", label: "Link (optional)", type: "text" },
        ],
      },
      TONE,
    ],
  },
  horizontal: {
    label: "Horizontal scroll",
    description: "Pinned section that scrolls cards sideways. Uses categories unless custom cards are added.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      {
        name: "items",
        label: "Custom cards (leave empty to show categories)",
        type: "list",
        itemLabel: "title",
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "subtitle", label: "Subtitle", type: "text" },
          { name: "image", label: "Image", type: "image" },
          { name: "href", label: "Link", type: "text" },
        ],
      },
      TONE,
    ],
  },
  products: {
    label: "Products",
    description: "Bento grid or rail of products.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      {
        name: "mode",
        label: "Which products",
        type: "select",
        options: [
          { label: "Featured", value: "featured" },
          { label: "Latest / all", value: "all" },
          { label: "From a category", value: "category" },
          { label: "Pick manually", value: "manual" },
        ],
      },
      { name: "category", label: "Category (if mode = category)", type: "ref", collection: "categories" },
      { name: "products", label: "Products (if mode = manual)", type: "refMulti", collection: "products", wide: true },
      { name: "limit", label: "Max items", type: "number" },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: [
          { label: "Bento grid", value: "bento" },
          { label: "Draggable rail", value: "rail" },
        ],
      },
      { name: "cta", label: "Button", type: "group", fields: LINK_FIELDS },
      TONE,
    ],
  },
  split: {
    label: "Image + text",
    description: "Parallax image beside a heading, copy and bullet points.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      { name: "body", label: "Body", type: "textarea", wide: true },
      { name: "bullets", label: "Bullet points", type: "tags", wide: true },
      { name: "image", label: "Main image", type: "image" },
      { name: "image2", label: "Small overlapping image", type: "image" },
      {
        name: "side",
        label: "Image side",
        type: "select",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
      { name: "cta", label: "Button", type: "group", fields: LINK_FIELDS },
      TONE,
    ],
  },
  stats: {
    label: "Stats",
    description: "Counting numbers.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      {
        name: "items",
        label: "Numbers",
        type: "list",
        itemLabel: "label",
        fields: [
          { name: "value", label: "Value", type: "number" },
          { name: "suffix", label: "Suffix", type: "text", placeholder: "+" },
          { name: "label", label: "Label", type: "text" },
        ],
      },
      TONE,
    ],
  },
  process: {
    label: "Process",
    description: "Sticky heading with steps that light up while you scroll.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      { name: "image", label: "Image (optional)", type: "image" },
      {
        name: "steps",
        label: "Steps",
        type: "list",
        itemLabel: "title",
        fields: [
          { name: "title", label: "Title", type: "text" },
          { name: "text", label: "Text", type: "textarea" },
        ],
      },
      TONE,
    ],
  },
  projects: {
    label: "Projects stack",
    description: "Project cards that stack on top of each other on scroll.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "featuredOnly", label: "Featured projects only", type: "toggle" },
      { name: "limit", label: "Max items", type: "number" },
      { name: "cta", label: "Button", type: "group", fields: LINK_FIELDS },
      TONE,
    ],
  },
  gallery: {
    label: "Scattered gallery",
    description: "Images floating at different parallax speeds around a title.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      { name: "images", label: "Images (up to 6)", type: "images", wide: true },
      TONE,
    ],
  },
  testimonials: {
    label: "Testimonials",
    description: "Large rotating quotes from the testimonials collection.",
    fields: [{ name: "eyebrow", label: "Eyebrow", type: "text" }, TONE],
  },
  faq: {
    label: "FAQ",
    description: "Accordion of questions.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "text" },
      {
        name: "items",
        label: "Questions",
        type: "list",
        itemLabel: "q",
        fields: [
          { name: "q", label: "Question", type: "text" },
          { name: "a", label: "Answer", type: "textarea" },
        ],
      },
      TONE,
    ],
  },
  cta: {
    label: "Call to action",
    description: "Huge closing statement with a magnetic round button.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title (wrap a word in *stars* to highlight)", type: "textarea" },
      { name: "button", label: "Button", type: "group", fields: LINK_FIELDS },
      { name: "image", label: "Background image (optional)", type: "image" },
      TONE,
    ],
  },
  pageHeader: {
    label: "Page header",
    description: "Title block for inner pages.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title (wrap a word in *stars* to highlight)", type: "textarea" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "image", label: "Image (optional)", type: "image" },
      TONE,
    ],
  },
  richText: {
    label: "Rich text",
    description: "Free text. Use ## for headings, - for bullets, **bold**.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "body", label: "Text", type: "textarea", wide: true },
      TONE,
    ],
  },
  contact: {
    label: "Contact form",
    description: "Enquiry form plus studio details. Submissions land in Admin → Inquiries.",
    fields: [
      { name: "eyebrow", label: "Eyebrow", type: "text" },
      { name: "title", label: "Title", type: "textarea" },
      { name: "text", label: "Text", type: "textarea" },
      { name: "interests", label: "Interest options", type: "tags", wide: true },
      { name: "image", label: "Image (optional)", type: "image" },
      TONE,
    ],
  },
};
