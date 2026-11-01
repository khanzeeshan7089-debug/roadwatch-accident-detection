import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div
      data-ocid="page.loading_state"
      className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground"
    >
      <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  const ids = Array.from({ length: count }, (_, i) => `skeleton-${i}`);
  return (
    <div
      data-ocid="page.loading_state"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {ids.map((id) => (
        <Skeleton key={id} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      data-ocid="page.empty_state"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-accent">
        {icon ?? <Inbox className="size-6" aria-hidden="true" />}
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      data-ocid="page.error_state"
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        Something went wrong
      </h3>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          data-ocid="page.retry_button"
          onClick={onRetry}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
}

/** Renders the correct state for a React Query result, or the children when data is ready. */
export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Data will appear here once records are available.",
  emptyAction,
  onRetry,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (isLoading) return <LoadingState />;
  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "The request could not be completed.";
    return <ErrorState message={message} onRetry={onRetry} />;
  }
  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }
  return <>{children}</>;
}
