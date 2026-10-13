import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  /** Primary action. Full width on phones, right aligned on larger screens. */
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, action, className }: Props) {
  return (
    <header
      className={cn(
        "mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? (
        <div className="flex shrink-0 flex-col gap-2 [&>*]:w-full md:flex-row md:[&>*]:w-auto">
          {action}
        </div>
      ) : null}
    </header>
  );
}
