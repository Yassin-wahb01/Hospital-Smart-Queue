import { CalendarCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pending", classes: "text-warning border-warning/30 bg-warning/15", Icon: Clock },
  confirmed: { label: "Confirmed", classes: "text-success border-success/30 bg-success/15", Icon: CalendarCheck },
  completed: { label: "Completed", classes: "text-info border-info/30 bg-info/15", Icon: CheckCircle2 },
  cancelled: { label: "Cancelled", classes: "text-destructive border-destructive/30 bg-destructive/15", Icon: XCircle },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const { label, classes, Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
