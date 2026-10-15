import { ResultLookup } from "@/components/public/ResultLookup";
import { getPublicExams, getPublicSite } from "@/lib/publicSite";

export default async function SchoolResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await getPublicSite(slug);
  const exams = (await getPublicExams(slug)) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Results</h1>
      {exams.length === 0 ? (
        <p className="text-muted-foreground">No published results yet.</p>
      ) : (
        <ResultLookup slug={slug} mode={site?.resultLookupMode ?? "roll_dob"} exams={exams} />
      )}
    </div>
  );
}
