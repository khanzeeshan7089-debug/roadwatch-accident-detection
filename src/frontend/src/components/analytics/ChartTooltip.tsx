import { formatCount } from "@/lib/roadwatch";

/** Shared dark control-room tooltip used by every Recharts chart. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueLabel = "Count",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
  valueLabel?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur">
      {label !== undefined && label !== "" && (
        <p className="mb-1 font-display text-xs font-semibold text-foreground">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, index) => (
          <li
            key={`${entry.name ?? "value"}-${index}`}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span>{entry.name ?? valueLabel}</span>
            <span className="ml-auto font-mono-num font-medium text-foreground">
              {formatCount(entry.value as number)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
