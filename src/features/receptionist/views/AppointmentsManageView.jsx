import { Calendar } from "lucide-react";

export default function AppointmentsManageView({ appointments, onUpdateStatus }) {
  const renderStatus = (apt) => {
    switch (apt.status) {
      case "pending":
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>;
      case "confirmed":
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Confirmed</span>;
      case "checked-in":
        return <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Checked In</span>;
      case "completed":
        return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Completed</span>;
      case "cancelled":
        return <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive dark:bg-destructive/20 dark:text-destructive">Cancelled</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-400">{apt.status}</span>;
    }
  };

  const renderActions = (apt) => {
    const actions = [];
    if (apt.status === "pending") {
      actions.push(
        <button
          key="confirm"
          onClick={() => onUpdateStatus(apt._id, "confirmed")}
          className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted shadow-sm"
        >
          Confirm
        </button>
      );
    }
    
    if (["pending", "confirmed", "checked-in"].includes(apt.status)) {
      actions.push(
        <button
          key="cancel"
          onClick={() => onUpdateStatus(apt._id, "cancelled")}
          className="px-2 py-1.5 text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
        >
          Cancel
        </button>
      );
    }

    return actions.length > 0 ? <div className="flex items-center gap-3">{actions}</div> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Manage Appointments</h2>
          <p className="text-sm text-muted-foreground">Confirm or cancel appointments</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No appointments found.</p>
          ) : (
            appointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{apt.patientName} → Dr. {apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.date} • {apt.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {renderStatus(apt)}
                  {renderActions(apt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
