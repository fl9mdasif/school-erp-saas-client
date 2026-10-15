import Image from "next/image";
import { getPublicSite } from "@/lib/publicSite";

export default async function SchoolGalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  const gallery = site?.gallery ?? [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Gallery</h1>
      {gallery.length === 0 ? (
        <p className="text-muted-foreground">No photos yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {gallery.map((g, i) => (
            <figure key={i} className="overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-video">
                <Image src={g.url} alt={g.caption ?? ""} fill className="object-cover" />
              </div>
              {g.caption ? <figcaption className="p-2 text-xs text-muted-foreground">{g.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
