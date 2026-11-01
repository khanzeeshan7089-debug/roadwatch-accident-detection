import { PageHeader } from "@/components/PageHeader";
import { AccidentEventList } from "@/components/accidents/AccidentEventList";
import { DetectionConditionsCard } from "@/components/accidents/DetectionConditionsCard";
import { DetectionPipelineCard } from "@/components/accidents/DetectionPipelineCard";
import { SimulationModeCard } from "@/components/accidents/SimulationModeCard";
import { ShieldAlert } from "lucide-react";

export default function AccidentDetectionPage() {
  return (
    <section data-ocid="accidents.page" className="flex flex-col gap-6">
      <PageHeader
        icon={ShieldAlert}
        title="Accident Detection"
        description="Review the accident-analysis pipeline over consecutive frames. Detection runs in clearly labelled simulation mode when no trained model is available."
      />

      <DetectionPipelineCard />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetectionConditionsCard />
        <SimulationModeCard />
      </div>

      <AccidentEventList />
    </section>
  );
}
