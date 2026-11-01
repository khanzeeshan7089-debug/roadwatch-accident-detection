import type { Camera } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/PageState";
import { AddCameraDialog } from "@/components/cameras/AddCameraDialog";
import { CameraCard } from "@/components/cameras/CameraCard";
import { CameraSourceDialog } from "@/components/cameras/CameraSourceDialog";
import { Button } from "@/components/ui/button";
import { useCameras } from "@/hooks/useRoadwatch";
import { Camera as CameraIcon, Plus, Video } from "lucide-react";
import { useState } from "react";

export default function CameraManagementPage() {
  const camerasQuery = useCameras();
  const [addOpen, setAddOpen] = useState(false);
  const [sourceCamera, setSourceCamera] = useState<Camera | null>(null);

  const cameras = camerasQuery.data ?? [];

  return (
    <section data-ocid="cameras.page">
      <PageHeader
        icon={CameraIcon}
        title="Camera Management"
        description="Register cameras, configure RTSP streams or uploaded video sources, and control monitoring state for each location."
        actions={
          <Button
            type="button"
            data-ocid="cameras.add_button"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add camera
          </Button>
        }
      />

      <QueryState
        isLoading={camerasQuery.isLoading}
        isError={camerasQuery.isError}
        error={camerasQuery.error}
        isEmpty={cameras.length === 0}
        emptyTitle="No cameras registered"
        emptyDescription="Add your first surveillance camera to start monitoring roads and detecting incidents."
        emptyAction={
          <Button
            type="button"
            data-ocid="cameras.empty_add_button"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add camera
          </Button>
        }
        onRetry={() => void camerasQuery.refetch()}
      >
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Video className="size-4 text-accent" aria-hidden="true" />
          <span>
            {cameras.length} {cameras.length === 1 ? "camera" : "cameras"}{" "}
            registered
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cameras.map((camera, index) => (
            <CameraCard
              key={camera.id.toString()}
              camera={camera}
              index={index + 1}
              onConfigureSource={setSourceCamera}
            />
          ))}
        </div>
      </QueryState>

      <AddCameraDialog open={addOpen} onOpenChange={setAddOpen} />
      <CameraSourceDialog
        camera={sourceCamera}
        open={sourceCamera !== null}
        onOpenChange={(open) => {
          if (!open) setSourceCamera(null);
        }}
      />
    </section>
  );
}
