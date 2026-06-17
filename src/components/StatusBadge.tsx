import type { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["appointment_status"];

const STYLES: Record<Status, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  completed: "bg-primary/10 text-primary border-primary/30",
};

const LABELS: Record<Status, string> = {
  pending: "Pending", approved: "Approved", rejected: "Rejected", completed: "Completed",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}