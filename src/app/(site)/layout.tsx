import { getCollection, getSettings } from "@/lib/db";
import { Cursor, Footer, Header, PageFade, Preloader, SmoothScroll } from "@/components/site/chrome";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const categories = await getCollection("categories");
  const menuImages = categories.map((c) => c.image).filter(Boolean).slice(0, 6);
  const { features, brand } = settings;

  return (
    <div className="site-shell">
      <SmoothScroll enabled={features.smoothScroll}>
        {features.preloader && <Preloader word={brand.logoText || brand.name} />}
        {features.customCursor && <Cursor />}
        {features.grain && <div className="grain" aria-hidden />}
        <Header settings={settings} menuImages={menuImages} />
        <main>
          <PageFade word={brand.logoText || brand.name}>{children}</PageFade>
        </main>
        <Footer settings={settings} />
      </SmoothScroll>
    </div>
  );
}
