"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { instance } from "@/helpers/axios/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";

type TForm = { name: string; phone: string; classInterest: string; message: string; website: string };

/** The admission inquiry form on the public site. `website` is a honeypot: hidden from real visitors. */
export function InquiryForm({ slug }: { slug: string }) {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<TForm>({
    defaultValues: { name: "", phone: "", classInterest: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "/api/v1";
      await instance.post(`${baseURL}/public/schools/${slug}/inquiries`, {
        name: v.name,
        phone: v.phone,
        classInterest: v.classInterest || undefined,
        message: v.message || undefined,
        website: v.website || undefined,
      });
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t));
    }
  });

  if (sent) return <p role="status" className="rounded-lg bg-success-tint p-4 text-sm font-medium text-success-deep">Thank you. We will contact you soon.</p>;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="inq-name">Your name</Label>
        <Input id="inq-name" required {...register("name")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inq-phone">Mobile number</Label>
        <Input id="inq-phone" required inputMode="numeric" placeholder="01XXXXXXXXX" {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inq-class">Class of interest</Label>
        <Input id="inq-class" {...register("classInterest")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inq-message">Message</Label>
        <Textarea id="inq-message" {...register("message")} />
      </div>
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="inq-website">Website</label>
        <input id="inq-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Send inquiry
      </Button>
    </form>
  );
}
