import Link from "next/link";
import { getPublicNotices, getPublicSite } from "@/lib/publicSite";

export default async function SchoolHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = (await getPublicSite(slug))!;
  const notices = site.sectionsVisible?.notices !== false ? await getPublicNotices(slug, 1) : [];
  const visible = site.sectionsVisible ?? {};

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    name: site.school.name,
    address: site.contact?.address,
    telephone: site.contact?.phone,
    email: site.contact?.email,
  };

  return (
    <div className="space-y-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="rounded-2xl bg-primary-tint p-8 text-center sm:p-12">
        <h1 className="text-2xl font-bold text-navy sm:text-4xl">{site.hero?.title || site.school.name}</h1>
        {site.hero?.subtitle ? <p className="mt-3 text-muted-foreground">{site.hero.subtitle}</p> : null}
        {visible.admission !== false && site.admissionInfo?.isOpen ? (
          <Link href={`/schools/${slug}/admission`} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Admission is open
          </Link>
        ) : null}
      </section>

      {visible.about !== false && site.about ? (
        <section>
          <h2 className="mb-2 text-xl font-semibold text-navy">About</h2>
          <p className="whitespace-pre-line text-muted-foreground">{site.about}</p>
        </section>
      ) : null}

      {site.headMessage?.text ? (
        <section className="rounded-xl border border-border p-6">
          <h2 className="mb-2 text-xl font-semibold text-navy">Message from {site.headMessage.designation}</h2>
          <p className="whitespace-pre-line text-muted-foreground">{site.headMessage.text}</p>
          <p className="mt-3 text-sm font-medium">— {site.headMessage.name}</p>
        </section>
      ) : null}

      {visible.notices !== false && notices && notices.length > 0 ? (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-navy">Latest notices</h2>
            <Link href={`/schools/${slug}/notices`} className="text-sm font-medium text-primary hover:underline">
              See all
            </Link>
          </div>
          <ul className="space-y-2">
            {notices.slice(0, 5).map((n) => (
              <li key={n._id}>
                <Link href={`/schools/${slug}/notices/${n._id}`} className="block rounded-lg border border-border p-3 hover:bg-accent">
                  <span className="font-medium text-navy">{n.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{n.publishAt.slice(0, 10)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
