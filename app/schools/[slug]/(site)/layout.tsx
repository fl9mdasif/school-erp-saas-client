import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TenantThemeProvider } from "@/components/providers/TenantThemeProvider";
import { getPublicSite } from "@/lib/publicSite";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site) return { robots: { index: false, follow: false } };
  const name = site.school.name ?? slug;
  return {
    title: site.seo?.title || name,
    description: site.seo?.description || site.about?.slice(0, 160),
    alternates: { canonical: `/schools/${slug}` },
    openGraph: { title: site.seo?.title || name, description: site.seo?.description, images: site.hero?.imageUrl ? [site.hero.imageUrl] : undefined },
  };
}

const NAV = [
  { href: "", label: "Home" },
  { href: "/notices", label: "Notices" },
  { href: "/teachers", label: "Teachers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/admission", label: "Admission" },
  { href: "/results", label: "Results" },
];

/** Public visitor pages only (home, notices, teachers, gallery, admission, results). Login lives
 * outside this group and never depends on the site being published. */
export default async function SchoolSiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  if (!site) notFound();

  const visible = site.sectionsVisible ?? {};
  const nav = NAV.filter((n) => {
    if (n.href === "/teachers") return visible.teachers !== false;
    if (n.href === "/gallery") return visible.gallery !== false;
    if (n.href === "/admission") return visible.admission !== false;
    if (n.href === "/results") return visible.results !== false;
    if (n.href === "/notices") return visible.notices !== false;
    return true;
  });

  return (
    <TenantThemeProvider theme={site.school.type ?? "school"} primaryColor={site.theme?.primaryColor}>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href={`/schools/${slug}`} className="flex min-w-0 items-center gap-2 font-semibold text-navy">
            {site.school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.school.logoUrl} alt="" className="size-9 rounded-full object-cover" />
            ) : null}
            <span className="truncate">{site.school.name}</span>
          </Link>
          <nav aria-label="Main" className="flex gap-1 overflow-x-auto text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={`/schools/${slug}${n.href}`} className="min-h-11 rounded-md px-3 py-2 font-medium hover:bg-accent">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>{site.contact?.address}</p>
        <p>{site.contact?.phone}{site.contact?.phone && site.contact?.email ? " · " : ""}{site.contact?.email}</p>
      </footer>
    </TenantThemeProvider>
  );
}
