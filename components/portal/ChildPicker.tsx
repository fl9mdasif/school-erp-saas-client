"use client";

import { useGetMyStudentsQuery } from "@/redux/api/portalApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useUrlState } from "@/lib/useUrlState";
import type { TStudent } from "@/types";

const DEFAULTS = { child: "" };

/** Resolves which linked student is active, persisted as ?child= in the URL. A student has exactly
 * one; a guardian may have several and gets a switcher once there is more than one. */
export function ChildPicker({ children }: { children: (activeId: string, students: TStudent[]) => React.ReactNode }) {
  const { data, isLoading, error, refetch } = useGetMyStudentsQuery();
  const url = useUrlState(DEFAULTS);
  const activeId = url.get("child");

  if (isLoading) return <Skeleton className="h-10 w-full max-w-sm" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No linked student found.</p>;

  const effective = data.some((s) => s._id === activeId) ? activeId : data[0]._id;

  return (
    <>
      {data.length > 1 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto" role="tablist" aria-label="Child">
          {data.map((s) => (
            <button
              key={s._id}
              type="button"
              role="tab"
              aria-selected={effective === s._id}
              onClick={() => url.set({ child: s._id })}
              className={`min-h-11 shrink-0 rounded-md border px-4 text-sm font-medium ${effective === s._id ? "border-primary bg-primary-tint text-primary-deep" : "border-input"}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      ) : null}
      {children(effective, data)}
    </>
  );
}
