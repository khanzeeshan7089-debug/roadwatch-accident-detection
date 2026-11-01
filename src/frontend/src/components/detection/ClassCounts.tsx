import { VehicleClass } from "@/backend";
import { formatCount, vehicleClassLabel } from "@/lib/roadwatch";
import { cn } from "@/lib/utils";
import { Bike, Bus, Car, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CLASS_ORDER: VehicleClass[] = [
  VehicleClass.car,
  VehicleClass.motorcycle,
  VehicleClass.bus,
  VehicleClass.truck,
];

const CLASS_ICON: Record<VehicleClass, LucideIcon> = {
  [VehicleClass.car]: Car,
  [VehicleClass.motorcycle]: Bike,
  [VehicleClass.bus]: Bus,
  [VehicleClass.truck]: Truck,
};

const CLASS_ACCENT: Record<VehicleClass, string> = {
  [VehicleClass.car]: "text-accent",
  [VehicleClass.motorcycle]: "text-primary",
  [VehicleClass.bus]: "text-warning",
  [VehicleClass.truck]: "text-success",
};

/** Per-class detection counts for the current session. */
export function ClassCounts({
  counts,
  total,
}: {
  counts: Record<VehicleClass, number>;
  total: number;
}) {
  return (
    <div
      data-ocid="vehicles.class_counts"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {CLASS_ORDER.map((vehicleClass) => {
        const Icon = CLASS_ICON[vehicleClass];
        const count = counts[vehicleClass] ?? 0;
        const share = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div
            key={vehicleClass}
            data-ocid={`vehicles.class_count.${vehicleClass}`}
            className="rounded-lg border border-border bg-card p-3 transition-smooth hover:border-accent/50"
          >
            <div className="flex items-center justify-between">
              <Icon
                className={cn("size-4", CLASS_ACCENT[vehicleClass])}
                aria-hidden="true"
              />
              <span className="font-mono-num text-xs text-muted-foreground">
                {share}%
              </span>
            </div>
            <p className="mt-2 font-mono-num text-2xl font-semibold text-foreground">
              {formatCount(count)}
            </p>
            <p className="text-xs text-muted-foreground">
              {vehicleClassLabel(vehicleClass)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
