import Toast from "../../components/Toast";
import Logo from "../../components/Logo";
import useToast from "../../hooks/useToast";
import useAppointments from "../../hooks/useAppointments";
import useBlockTimes from "../../hooks/useBlockTimes";
import { todayISODate } from "../../utils/storage";
import { seedDemoScheduleIfEmpty } from "./seedDemoSchedule";
import KpiBar from "./components/KpiBar";
import ScheduleTimeline from "./components/ScheduleTimeline";
import BlockTimeForm from "./components/BlockTimeForm";

export default function DoctorDashboard({ doctorId, doctorName }) {
  // Runs synchronously during render, before useAppointments/useBlockTimes
  // read localStorage below — so their very first read already sees the
  // seeded data. It's idempotent (see seedDemoSchedule.js), so re-renders
  // are a cheap no-op once today's data exists.
  seedDemoScheduleIfEmpty(doctorId, doctorName);

  const { message, title, variant, showToast, hideToast } = useToast();
  const today = todayISODate();

  const { appointments, updateStatus } = useAppointments(doctorId, today);
  const { blocks, addBlock, removeBlock } = useBlockTimes(doctorId);

  const handleComplete = (id) => {
    updateStatus(id, "completed");
    showToast("The queue counter has been updated.", {
      title: "Consultation marked as completed",
      variant: "success",
    });
  };

  const handleCancel = (id) => {
    updateStatus(id, "cancelled");
    showToast("The patient's slot has been freed up.", {
      title: "Appointment cancelled",
      variant: "error",
    });
  };

  const handleAddBlock = (block) => {
    addBlock(block);
    showToast(`${block.date} · ${block.startTime}–${block.endTime} is now unavailable for booking.`, {
      title: "Time slot locked",
      variant: "info",
    });
  };

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 text-foreground md:p-6">
      <Toast message={message} title={title} variant={variant} onClose={hideToast} />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <Logo compact />
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{doctorName}</p>
          <p className="text-xs text-muted-foreground">Today's clinical schedule and queue overview</p>
        </div>
      </header>

      <KpiBar appointments={appointments} blocks={blocks} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Live Clinical Schedule</h2>
          <ScheduleTimeline appointments={appointments} onComplete={handleComplete} onCancel={handleCancel} />
        </section>

        <section>
          <BlockTimeForm blocks={blocks} onAddBlock={handleAddBlock} onRemoveBlock={removeBlock} />
        </section>
      </div>
    </div>
  );
}
