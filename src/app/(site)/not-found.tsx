import Link from "next/link";

export default function NotFound() {
  return (
    <section className="tone-light container-x flex min-h-[80vh] flex-col justify-center pt-32">
      <p className="eyebrow text-(--mute)">Error 404</p>
      <h1 className="display h-giant mt-6">
        Lost in the <span className="hl">hallway</span>
      </h1>
      <Link href="/" className="btn mt-12 self-start">Take me home</Link>
    </section>
  );
}
