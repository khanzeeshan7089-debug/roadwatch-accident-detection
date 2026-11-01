import { cn } from "@/lib/utils";

export type DotTone = "success" | "danger" | "warning" | "muted" | "accent";

const DOT_STYLES: Record<DotTone, string> = {
  success: "bg-success",
  danger: "bg-destructive",
  warning: "bg-warning",
  muted: "bg-muted-foreground",
  accent: "bg-accent",
};

export function StatusDot({
  tone,
  pulse = false,
  className,
}: {
  tone: DotTone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        DOT_STYLES[tone],
        pulse && "status-pulse",
        className,
      )}
    />
  );
}
