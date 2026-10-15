import { PortalNoticeDetail } from "@/components/portal/PortalNoticeDetail";

export default async function PortalNoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalNoticeDetail id={id} />;
}
