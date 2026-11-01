import type { Incident } from "@/backend";
import { IncidentStatusBadge } from "@/components/incidents/IncidentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatTimestamp, incidentLocation } from "@/lib/roadwatch";
import { ChevronRight, MapPin } from "lucide-react";

export function IncidentTable({
  incidents,
  onSelect,
}: {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
}) {
  return (
    <div
      data-ocid="incidents.table"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <Table>
        <TableHeader className="bg-secondary/60">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24 pl-4">Incident</TableHead>
            <TableHead className="w-32">Camera</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-40">Date</TableHead>
            <TableHead className="w-44">Time</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-16 pr-4 text-right">
              <span className="sr-only">Open</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident, index) => (
            <TableRow
              key={incident.id.toString()}
              data-ocid={`incidents.row.${index + 1}`}
              className="cursor-pointer"
              onClick={() => onSelect(incident)}
            >
              <TableCell className="pl-4">
                <span className="font-mono-num text-sm font-semibold text-accent">
                  #{incident.id.toString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-foreground">
                  {incident.cameraCode || "—"}
                </span>
              </TableCell>
              <TableCell className="max-w-[16rem]">
                <span className="flex items-center gap-1.5 text-sm text-foreground">
                  <MapPin
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {incidentLocation(incident) || "Unknown location"}
                  </span>
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(incident.detectedAt)}
              </TableCell>
              <TableCell className="font-mono-num text-sm text-muted-foreground">
                {formatTimestamp(incident.detectedAt)}
              </TableCell>
              <TableCell>
                <IncidentStatusBadge status={incident.status} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Open incident ${incident.id.toString()}`}
                  data-ocid={`incidents.open_button.${index + 1}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(incident);
                  }}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
