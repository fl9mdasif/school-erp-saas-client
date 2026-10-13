import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** The centred card used by sign up, sign in and password pages. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-8 md:py-14">
      <Link href="/" aria-label="Home" className="mb-6 rounded-md">
        <Brand onLight />
      </Link>
      <Card className={cn("w-full p-5 md:p-8", wide ? "max-w-2xl" : "max-w-md")}>
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </Card>
      {footer ? <div className="mt-5 text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
