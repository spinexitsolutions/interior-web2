export type Tone = "light" | "surface" | "dark" | "accent";

export type LinkItem = { label: string; href: string };

export type Settings = {
  brand: {
    name: string;
    logoText: string;
    logoImage: string;
    tagline: string;
    currency: string;
  };
  theme: {
    mode: "auto" | "light" | "dark";
    bg: string;
    surface: string;
    ink: string;
    muted: string;
    accent: string;
    dark: string;
    onDark: string;
    displayFont: string;
    bodyFont: string;
    displayWeight: string;
    displayTracking: number;
    radius: number;
  };
  nav: LinkItem[];
  navCta: LinkItem;
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  socials: LinkItem[];
  footer: {
    bigText: string;
    note: string;
    copyright: string;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  features: {
    preloader: boolean;
    customCursor: boolean;
    smoothScroll: boolean;
    grain: boolean;
  };
};

export type Section = {
  id: string;
  type: string;
  enabled: boolean;
  data: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  sections: Section[];
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAt: number;
  shortDescription: string;
  description: string;
  images: string[];
  materials: string[];
  dimensions: string;
  colors: { name: string; hex: string }[];
  featured: boolean;
  inStock: boolean;
  order: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  location: string;
  year: string;
  type: string;
  area: string;
  cover: string;
  gallery: string[];
  summary: string;
  body: string;
  featured: boolean;
  order: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  order: number;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type Collections = {
  products: Product[];
  categories: Category[];
  projects: Project[];
  testimonials: Testimonial[];
};

export type CollectionName = keyof Collections;

export type DB = Collections & {
  settings: Settings;
  pages: Page[];
  inquiries: Inquiry[];
  admin?: { email: string; passwordHash: string };
};
