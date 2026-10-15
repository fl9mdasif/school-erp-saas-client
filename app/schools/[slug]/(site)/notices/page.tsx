import Link from "next/link";
import { getPublicNotices } from "@/lib/publicSite";

export default async function SchoolNoticesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const notices = (await getPublicNotices(slug, 1)) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Notices</h1>
      {notices.length === 0 ? (
        <p className="text-muted-foreground">No notices yet.</p>
      ) : (
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n._id}>
              <Link href={`/schools/${slug}/notices/${n._id}`} className="block rounded-lg border border-border p-4 hover:bg-accent">
                <span className="block font-medium text-navy">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.publishAt.slice(0, 10)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
