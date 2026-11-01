import { cn } from "@/lib/utils";
import { RadioTower } from "lucide-react";

/**
 * Persistent, unmissable notice that responder notifications are simulated.
 * Rendered on every alert surface so no operator mistakes a simulated
 * dispatch for a real emergency-service contact.
 */
export function SimulationNotice({ className }: { className?: string }) {
  return (
    <div
      data-ocid="alerts.simulation_notice"
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3",
        className,
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
        <RadioTower className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-warning">
          Notifications are simulated
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Police and hospital dispatch statuses shown here are simulated for
          demonstration. No real emergency service is contacted and no message
          leaves this console.
        </p>
      </div>
    </div>
  );
}
