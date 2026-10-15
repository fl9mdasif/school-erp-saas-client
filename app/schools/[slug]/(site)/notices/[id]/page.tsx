import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RichText } from "@/components/common/RichText";
import { getPublicNotice } from "@/lib/publicSite";

export default async function SchoolNoticeDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const notice = await getPublicNotice(slug, id);
  if (!notice) notFound();

  return (
    <article>
      <Link href={`/schools/${slug}/notices`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All notices
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-navy">{notice.title}</h1>
      <p className="mb-4 text-xs text-muted-foreground">{notice.publishAt.slice(0, 10)}</p>
      <RichText html={notice.body} className="prose max-w-none" />
      {notice.attachments && notice.attachments.length > 0 ? (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium">Attachments</p>
          {notice.attachments.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline">
              {a.name ?? `Attachment ${i + 1}`}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
