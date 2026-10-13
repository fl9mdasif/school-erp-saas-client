import { NoticeForm } from "@/components/notices/NoticeForm";

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeForm noticeId={id} />;
}
