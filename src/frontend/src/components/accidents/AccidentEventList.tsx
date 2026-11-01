import { QueryState } from "@/components/PageState";
import { AccidentEventCard } from "@/components/accidents/AccidentEventCard";
import { useIncidents } from "@/hooks/useRoadwatch";

export function AccidentEventList() {
  const incidents = useIncidents();
  const events = incidents.data ?? [];

  return (
    <section
      data-ocid="accidents.events_section"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Potential accident events
        </h2>
        {events.length > 0 && (
          <span className="font-mono-num text-sm text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <QueryState
        isLoading={incidents.isLoading}
        isError={incidents.isError}
        error={incidents.error}
        isEmpty={events.length === 0}
        onRetry={() => void incidents.refetch()}
        emptyTitle="No potential accidents detected"
        emptyDescription="The analysis pipeline has not raised any potential accident events yet. Generate one from simulation mode to see the full event record."
      >
        <ul className="flex flex-col gap-3">
          {events.map((incident, index) => (
            <li key={incident.id.toString()}>
              <AccidentEventCard incident={incident} index={index} />
            </li>
          ))}
        </ul>
      </QueryState>
    </section>
  );
}
