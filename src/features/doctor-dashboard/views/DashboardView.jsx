import KpiBar from "../components/KpiBar";
import ScheduleTimeline from "../components/ScheduleTimeline";

export default function DashboardView({ appointments, blocks, onComplete, onCancel }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">A snapshot of today's queue.</p>
      </div>

      <KpiBar appointments={appointments} blocks={blocks} />

      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Today's Schedule</h3>
        <ScheduleTimeline appointments={appointments} onComplete={onComplete} onCancel={onCancel} />
      </div>
    </div>
  );
}