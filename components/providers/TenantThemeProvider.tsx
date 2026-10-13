import { cn } from "@/lib/utils";

export type TTenantTheme = "school" | "madrasa" | "coaching";

// Wraps the PUBLIC school pages only. The tokens for each preset live in app/globals.css under
// [data-tenant-theme]. The dashboard never uses this: it always shows the platform brand.
// A tenant's custom hex colour (website settings) is applied as an inline override of --primary.
export function TenantThemeProvider({
  theme = "school",
  primaryColor,
  className,
  children,
}: {
  theme?: TTenantTheme;
  /** Optional custom brand colour in #RRGGBB form; ignored if it is not a valid hex. */
  primaryColor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const custom = primaryColor && /^#[0-9a-fA-F]{6}$/.test(primaryColor) ? primaryColor : undefined;
  return (
    <div
      data-tenant-theme={theme}
      className={cn("min-h-dvh bg-background text-foreground", className)}
      style={custom ? ({ "--primary": custom, "--ring": custom } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
