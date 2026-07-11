import ScheduleTimeline from "../components/ScheduleTimeline";

export default function DailyScheduleView({ appointments, onComplete, onCancel }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Daily Schedule</h2>
        <p className="text-sm text-muted-foreground">Live, chronological view of today's queue.</p>
      </div>
      <ScheduleTimeline appointments={appointments} onComplete={onComplete} onCancel={onCancel} />
    </div>
  );
}
