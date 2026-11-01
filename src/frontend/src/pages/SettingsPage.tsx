import type { Settings } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, LoadingState } from "@/components/PageState";
import {
  DetectionSettingsCard,
  type DetectionSettingsDraft,
} from "@/components/settings/DetectionSettingsCard";
import { SampleDataCard } from "@/components/settings/SampleDataCard";
import {
  useLoadSampleData,
  useSettings,
  useUpdateSettings,
} from "@/hooks/useRoadwatch";
import { formatRelativeTime, roadwatchErrorMessage } from "@/lib/roadwatch";
import { Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

function toDraft(settings: Settings): DetectionSettingsDraft {
  return {
    sensitivity: Math.round(settings.sensitivity * 100),
    confidenceThreshold: Math.round(settings.confidenceThreshold * 100),
    simulationMode: settings.simulationMode,
  };
}

export default function SettingsPage() {
  const settingsQuery = useSettings();
  const updateSettings = useUpdateSettings();
  const loadSampleData = useLoadSampleData();

  const [draft, setDraft] = useState<DetectionSettingsDraft | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const settings = settingsQuery.data ?? null;

  // Initialize the editable draft once the settings record first arrives.
  useEffect(() => {
    if (settings && draft === null) {
      setDraft(toDraft(settings));
    }
  }, [settings, draft]);

  const isDirty =
    draft !== null &&
    settings !== null &&
    (draft.sensitivity !== Math.round(settings.sensitivity * 100) ||
      draft.confidenceThreshold !==
        Math.round(settings.confidenceThreshold * 100) ||
      draft.simulationMode !== settings.simulationMode);

  function handleChange(next: Partial<DetectionSettingsDraft>) {
    setDraft((current) => (current ? { ...current, ...next } : current));
    setSaveError(null);
  }

  function handleSave() {
    if (!draft) return;
    setSaveError(null);
    updateSettings.mutate(
      {
        sensitivity: draft.sensitivity / 100,
        confidenceThreshold: draft.confidenceThreshold / 100,
        simulationMode: draft.simulationMode,
        lastSampleLoadedAt: settings?.lastSampleLoadedAt,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setSaveError(roadwatchErrorMessage(result.err));
            return;
          }
          setSavedAt(formatRelativeTime(BigInt(Date.now()) * 1_000_000n));
        },
        onError: (error) => {
          setSaveError(
            error instanceof Error
              ? error.message
              : "Settings could not be saved.",
          );
        },
      },
    );
  }

  function handleLoadSample() {
    loadSampleData.mutate(undefined, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          return;
        }
        void settingsQuery.refetch();
      },
    });
  }

  const sampleError = loadSampleData.isError
    ? loadSampleData.error instanceof Error
      ? loadSampleData.error.message
      : "Sample data could not be loaded."
    : loadSampleData.data?.__kind__ === "err"
      ? roadwatchErrorMessage(loadSampleData.data.err)
      : null;

  return (
    <section data-ocid="settings.page">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Configure detection sensitivity, confidence threshold and simulation mode, and load sample demonstration data."
      />

      {settingsQuery.isLoading ? (
        <LoadingState label="Loading settings…" />
      ) : settingsQuery.isError ? (
        <ErrorState
          message={
            settingsQuery.error instanceof Error
              ? settingsQuery.error.message
              : "Settings could not be loaded."
          }
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : !settings || !draft ? (
        <ErrorState
          message="No settings record is available yet."
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <DetectionSettingsCard
            draft={draft}
            onChange={handleChange}
            onSave={handleSave}
            isSaving={updateSettings.isPending}
            isDirty={isDirty}
            savedAt={savedAt}
            errorMessage={saveError}
          />
          <SampleDataCard
            lastLoadedLabel={formatRelativeTime(settings.lastSampleLoadedAt)}
            onLoad={handleLoadSample}
            isPending={loadSampleData.isPending}
            isSuccess={
              loadSampleData.isSuccess && loadSampleData.data?.__kind__ === "ok"
            }
            errorMessage={sampleError}
          />
        </div>
      )}
    </section>
  );
}
