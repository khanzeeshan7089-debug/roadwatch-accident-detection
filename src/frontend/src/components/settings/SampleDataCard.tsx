import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Database,
  Loader2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

const SAMPLE_CONTENTS = [
  "Example cameras across the monitored road network",
  "Potential accident incidents with verification states",
  "Detection logs with vehicle classes and confidence scores",
];

export function SampleDataCard({
  lastLoadedLabel,
  onLoad,
  isPending,
  isSuccess,
  errorMessage,
}: {
  lastLoadedLabel: string;
  onLoad: () => void;
  isPending: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section
      data-ocid="settings.sample_card"
      className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6"
    >
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
          <Database className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Sample demonstration data
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Populate the console with example records for a seminar demo.
          </p>
        </div>
      </header>

      <ul className="mt-5 space-y-2">
        {SAMPLE_CONTENTS.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Sparkles
              className="mt-0.5 size-3.5 shrink-0 text-accent"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
        Loading sample data adds example records to the console. It does not
        replace or delete existing cameras, incidents or detection logs.
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button
          type="button"
          data-ocid="settings.load_sample_button"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Database className="size-4" aria-hidden="true" />
          )}
          {isPending ? "Loading sample data…" : "Load sample data"}
        </Button>

        <span
          data-ocid="settings.last_sample_loaded"
          className="text-xs text-muted-foreground"
        >
          Last loaded:{" "}
          <span className="font-mono-num text-foreground">
            {lastLoadedLabel}
          </span>
        </span>
      </div>

      {isSuccess && (
        <output
          data-ocid="settings.sample_success"
          className={cn(
            "mt-4 flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs text-success",
          )}
        >
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Sample demonstration data loaded successfully.
        </output>
      )}

      {errorMessage && (
        <output
          data-ocid="settings.sample_error"
          className="mt-4 flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <TriangleAlert className="size-3.5" aria-hidden="true" />
          {errorMessage}
        </output>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent data-ocid="settings.sample_confirm_dialog">
          <DialogHeader>
            <DialogTitle>Load sample demonstration data?</DialogTitle>
            <DialogDescription>
              This adds example cameras, incidents and detection logs to the
              console for a seminar demo. Existing records are kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="settings.sample_cancel_button"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="settings.sample_confirm_button"
              onClick={() => {
                setConfirmOpen(false);
                onLoad();
              }}
            >
              <Database className="size-4" aria-hidden="true" />
              Load sample data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
