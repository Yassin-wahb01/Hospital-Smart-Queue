import { useState } from "react";
import { Calendar } from "lucide-react";

export default function QueueManageView({ appointments, onUpdateStatus }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredAppointments = appointments.filter((apt) => apt.date === selectedDate);

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
    
    if (apt.status === "confirmed") {
      actions.push(
        <button
          key="checkin"
          onClick={() => onUpdateStatus(apt._id, "checked-in")}
          className="rounded-lg border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted shadow-sm"
        >
          Check In
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Daily Queue</h2>
          <p className="text-sm text-muted-foreground">Manage patient queue</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
          <span className="text-sm font-medium text-muted-foreground">Date:</span>
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground outline-none border-none focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          {filteredAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No appointments found for this date.</p>
          ) : (
            filteredAppointments.map((apt, index) => (
              <div key={apt._id} className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">Dr. {apt.doctorName} • {apt.time}</p>
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
