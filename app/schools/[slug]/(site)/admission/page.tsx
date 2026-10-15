import { InquiryForm } from "@/components/public/InquiryForm";
import { getPublicSite } from "@/lib/publicSite";

export default async function SchoolAdmissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  const info = site?.admissionInfo;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-navy">Admission</h1>
        {info?.isOpen ? (
          <p className="font-medium text-success-deep">Admission is open{info.lastDate ? ` until ${info.lastDate}` : ""}.</p>
        ) : (
          <p className="text-muted-foreground">Admission is currently closed.</p>
        )}
        {info?.text ? <p className="mt-3 whitespace-pre-line text-muted-foreground">{info.text}</p> : null}
        {info?.classes && info.classes.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Open for: {info.classes.join(", ")}</p>
        ) : null}
      </div>
      <div>
        <h2 className="mb-3 text-xl font-semibold text-navy">Ask us a question</h2>
        <InquiryForm slug={slug} />
      </div>
    </div>
  );
}
