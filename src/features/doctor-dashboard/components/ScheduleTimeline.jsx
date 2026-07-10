import AppointmentCard from "./AppointmentCard";
import EmptyState from "../../../components/EmptyState";

export default function ScheduleTimeline({ appointments, onComplete, onCancel }) {
  if (appointments.length === 0) {
    return <EmptyState message="No appointments match this state criteria." />;
  }

  return (
    <div className="relative pl-12">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-5">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="relative">
            <div className="absolute -left-7 top-4 h-4 w-4 rounded-full border border-primary bg-background" />
            <AppointmentCard appointment={appointment} onComplete={onComplete} onCancel={onCancel} />
          </div>
        ))}
      </div>
    </div>
  );
}
