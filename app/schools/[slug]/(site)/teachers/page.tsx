import Image from "next/image";
import { getPublicStaff } from "@/lib/publicSite";

export default async function SchoolTeachersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staff = (await getPublicStaff(slug)) ?? [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy">Our teachers</h1>
      {staff.length === 0 ? (
        <p className="text-muted-foreground">No profiles yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {staff.map((s) => (
            <div key={s._id} className="rounded-xl border border-border p-4 text-center">
              {s.photoUrl ? (
                <Image src={s.photoUrl} alt={s.name} width={80} height={80} className="mx-auto size-20 rounded-full object-cover" />
              ) : (
                <div className="mx-auto size-20 rounded-full bg-muted" />
              )}
              <p className="mt-3 font-semibold text-navy">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.designation}</p>
              {s.bio ? <p className="mt-2 text-sm text-muted-foreground">{s.bio}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
