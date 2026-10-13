import { TenantDetail } from "@/components/platform/TenantDetail";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TenantDetail id={id} />;
}
