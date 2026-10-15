"use client";

import { Download, Plus, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadFile, fetchFileUrl } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";

/** The PDF, viewed inline in an iframe, printed from it and downloadable. Shared by Collect fee and the payment detail page. */
export function Receipt({ paymentId, onCollectAnother }: { paymentId: string; onCollectAnother?: () => void }) {
  const { t } = useT();
  const [url, setUrl] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let active = true;
    let current: string | null = null;
    fetchFileUrl(`/payments/${paymentId}/receipt.pdf`)
      .then((u) => {
        if (!active) return URL.revokeObjectURL(u);
        current = u;
        setUrl(u);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, t)));
    return () => {
      active = false;
      if (current) URL.revokeObjectURL(current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  const print = () => frameRef.current?.contentWindow?.print();
  const download = () => downloadFile(`/payments/${paymentId}/receipt.pdf`, `receipt-${paymentId}.pdf`);

  return (
    <Card className="max-w-2xl">
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap gap-3">
          <Button onClick={print} disabled={!url}>
            <Printer aria-hidden="true" />
            {t("fee.rc.print")}
          </Button>
          <Button variant="outline" onClick={download} disabled={!url}>
            <Download aria-hidden="true" />
            {t("fee.rc.download")}
          </Button>
          {onCollectAnother ? (
            <Button variant="outline" onClick={onCollectAnother}>
              <Plus aria-hidden="true" />
              {t("fee.rc.another")}
            </Button>
          ) : null}
        </div>
        {url ? (
          <iframe ref={frameRef} src={url} title={t("fee.rc.title")} className="h-[480px] w-full rounded-lg border border-border" />
        ) : (
          <Skeleton className="h-[480px] w-full" />
        )}
      </CardContent>
    </Card>
  );
}
