import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  GitCompareArrows,
  type LucideIcon,
  ScanLine,
  ShieldAlert,
} from "lucide-react";

interface PipelineStage {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STAGES: PipelineStage[] = [
  {
    icon: ScanLine,
    title: "Vehicle detection",
    description:
      "Vehicles are located in each frame. Detection alone never confirms an accident.",
  },
  {
    icon: Activity,
    title: "Movement analysis",
    description:
      "Vehicle trajectories are tracked across consecutive frames to establish normal flow.",
  },
  {
    icon: GitCompareArrows,
    title: "Sudden motion changes",
    description:
      "Abrupt deceleration, sharp heading changes and abnormal vehicle interactions are flagged.",
  },
  {
    icon: ShieldAlert,
    title: "Collision patterns",
    description:
      "Overlapping trajectories and collision signatures raise a potential accident event.",
  },
];

export function DetectionPipelineCard() {
  return (
    <Card data-ocid="accidents.pipeline_card" className="gap-4">
      <CardHeader>
        <CardTitle className="font-display text-base">
          Analysis pipeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The pipeline evaluates vehicle movement, sudden motion changes,
          abnormal vehicle interactions and collision patterns across
          consecutive frames. Vehicle detection alone never confirms an
          accident.
        </p>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <li
                key={stage.title}
                data-ocid={`accidents.pipeline_stage.${index + 1}`}
                className="relative flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-background text-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {stage.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {stage.description}
                </p>
                {index < STAGES.length - 1 && (
                  <ArrowRight
                    className={cn(
                      "absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-border xl:block",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
