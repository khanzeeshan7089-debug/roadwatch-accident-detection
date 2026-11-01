import {
  type Incident,
  type IncidentId,
  ResolutionStatus,
  VerificationStatus,
} from "@/backend";
import {
  IncidentStatusBadge,
  ResolutionBadge,
  VerificationBadge,
} from "@/components/incidents/IncidentStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateIncidentStatus } from "@/hooks/useRoadwatch";
import {
  detectionSourceLabel,
  formatConfidence,
  formatCoordinates,
  formatTimestamp,
  incidentLocation,
  resolutionLabel,
  verificationLabel,
} from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cpu,
  ImageOff,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("text-sm text-foreground", mono && "font-mono-num")}>
        {value}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof MapPin;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-secondary/30 p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
        <Icon className="size-4 text-accent" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function IncidentDetailDialog({
  incident,
  open,
  onOpenChange,
}: {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateStatus = useUpdateIncidentStatus();
  const [verification, setVerification] = useState<VerificationStatus>(
    VerificationStatus.unverified,
  );
  const [resolution, setResolution] = useState<ResolutionStatus>(
    ResolutionStatus.unresolved,
  );

  useEffect(() => {
    if (incident) {
      setVerification(incident.verificationStatus);
      setResolution(incident.resolutionStatus);
    }
  }, [incident]);

  if (!incident) return null;

  const dirty =
    verification !== incident.verificationStatus ||
    resolution !== incident.resolutionStatus;

  const handleSave = () => {
    if (!incident) return;
    updateStatus.mutate({
      id: incident.id as IncidentId,
      verification,
      resolution,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="incidents.detail_dialog"
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <span className="font-mono-num text-accent">
              Incident #{incident.id.toString()}
            </span>
            <IncidentStatusBadge status={incident.status} />
          </DialogTitle>
          <DialogDescription>
            {incident.summary || "No summary recorded for this incident."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <DetailSection title="Event snapshot" icon={ImageOff}>
            {incident.snapshotRef ? (
              <div className="flex items-center gap-3 rounded-md border border-border bg-background/60 p-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-accent">
                  <Camera className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-foreground">
                    {incident.snapshotRef}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Captured frame reference
                  </p>
                </div>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageOff className="size-4" aria-hidden="true" />
                No snapshot was captured for this incident.
              </p>
            )}
          </DetailSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailSection title="Location" icon={MapPin}>
              <dl className="grid gap-3">
                <DetailRow
                  label="Road"
                  value={incident.roadName || "Unknown road"}
                />
                <DetailRow
                  label="Area"
                  value={incident.area || "Unknown area"}
                />
                <DetailRow
                  label="Coordinates"
                  value={formatCoordinates(
                    incident.latitude,
                    incident.longitude,
                  )}
                  mono
                />
              </dl>
            </DetailSection>

            <DetailSection title="Detection" icon={Cpu}>
              <dl className="grid gap-3">
                <DetailRow
                  label="Camera"
                  value={incident.cameraCode || "—"}
                  mono
                />
                <DetailRow
                  label="Source"
                  value={detectionSourceLabel(incident.detectionSource)}
                />
                <DetailRow
                  label="Confidence"
                  value={formatConfidence(incident.confidence)}
                  mono
                />
                <DetailRow
                  label="Detected at"
                  value={formatTimestamp(incident.detectedAt)}
                  mono
                />
              </dl>
            </DetailSection>
          </div>

          <DetailSection title="Verification & resolution" icon={ShieldCheck}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Current:</span>
              <VerificationBadge status={incident.verificationStatus} />
              <ResolutionBadge status={incident.resolutionStatus} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="incident-verification"
                  className="text-xs text-muted-foreground"
                >
                  Verification status
                </Label>
                <Select
                  value={verification}
                  onValueChange={(value) =>
                    setVerification(value as VerificationStatus)
                  }
                >
                  <SelectTrigger
                    id="incident-verification"
                    data-ocid="incidents.verification_select"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VerificationStatus.unverified}>
                      {verificationLabel(VerificationStatus.unverified)}
                    </SelectItem>
                    <SelectItem value={VerificationStatus.verified}>
                      {verificationLabel(VerificationStatus.verified)}
                    </SelectItem>
                    <SelectItem value={VerificationStatus.falseAlarm}>
                      {verificationLabel(VerificationStatus.falseAlarm)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="incident-resolution"
                  className="text-xs text-muted-foreground"
                >
                  Resolution status
                </Label>
                <Select
                  value={resolution}
                  onValueChange={(value) =>
                    setResolution(value as ResolutionStatus)
                  }
                >
                  <SelectTrigger
                    id="incident-resolution"
                    data-ocid="incidents.resolution_select"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ResolutionStatus.unresolved}>
                      {resolutionLabel(ResolutionStatus.unresolved)}
                    </SelectItem>
                    <SelectItem value={ResolutionStatus.resolved}>
                      {resolutionLabel(ResolutionStatus.resolved)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {updateStatus.isError && (
              <p
                data-ocid="incidents.update_error"
                className="mt-3 flex items-center gap-2 text-sm text-destructive"
              >
                <AlertTriangle className="size-4" aria-hidden="true" />
                {updateStatus.error instanceof Error
                  ? updateStatus.error.message
                  : "Could not update the incident status."}
              </p>
            )}
            {updateStatus.isSuccess && !dirty && (
              <p
                data-ocid="incidents.update_success"
                className="mt-3 flex items-center gap-2 text-sm text-success"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Incident status updated.
              </p>
            )}
          </DetailSection>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            data-ocid="incidents.close_button"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            data-ocid="incidents.save_button"
            disabled={!dirty || updateStatus.isPending}
            onClick={handleSave}
          >
            {updateStatus.isPending ? (
              <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            )}
            {updateStatus.isPending ? "Saving…" : "Save status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
