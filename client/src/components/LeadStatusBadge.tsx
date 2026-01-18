import { cn } from "@/lib/utils";

type Status = "new" | "processing" | "completed" | "failed";

export function LeadStatusBadge({ status }: { status: string }) {
  const styles: Record<Status, string> = {
    new: "bg-blue-100 text-blue-700 border-blue-200",
    processing: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };

  const labels: Record<Status, string> = {
    new: "New",
    processing: "Processing",
    completed: "Enriched",
    failed: "Failed",
  };

  const normalizedStatus = (status as Status) || "new";

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm",
      styles[normalizedStatus]
    )}>
      {labels[normalizedStatus]}
    </span>
  );
}
