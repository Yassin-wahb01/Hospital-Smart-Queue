import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import StatusBadge from "../../../components/StatusBadge";
import EmptyState from "../../../components/EmptyState";

function RowActions({ appointment, onComplete, onCancel }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isResolved = appointment.status === "completed" || appointment.status === "cancelled";

  if (isResolved) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onComplete(appointment._id)}
        className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <CheckCircle2 className="h-3 w-3" />
        Complete
      </button>

      {confirmingCancel ? (
        <button
          type="button"
          autoFocus
          onBlur={() => setConfirmingCancel(false)}
          onClick={() => {
            onCancel(appointment._id);
            setConfirmingCancel(false);
          }}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          Confirm?
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingCancel(true)}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function AppointmentsView({ appointments, onComplete, onCancel }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Appointments</h2>
        <p className="text-sm text-muted-foreground">Every booking on today's queue in one table.</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState message="No appointments match this state criteria." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Queue</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Complaint</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">#{appointment.queueNumber}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{appointment.patientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{appointment.timeSlot}</td>
                  <td className="px-4 py-3 text-muted-foreground">{appointment.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{appointment.complaint}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions appointment={appointment} onComplete={onComplete} onCancel={onCancel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
