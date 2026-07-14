import { Activity, Ban, CheckCircle2, Users } from "lucide-react";

export default function KpiBar({ appointments, blocks }) {
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "attended").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  const nextPatient = appointments
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))[0];

  const resolved = completed + cancelled;
  const attendanceRate = resolved > 0 ? Math.round((completed / resolved) * 100) : 100;

  const kpis = [
    {
      label: "Next Patient Up",
      Icon: Users,
      value: nextPatient ? nextPatient.patientName : "—",
      caption: nextPatient ? `Queue #${nextPatient.queueNumber} · ${nextPatient.timeSlot}` : "No one waiting",
    },
    {
      label: "Completed Consultations",
      Icon: CheckCircle2,
      value: `${completed}/${total}`,
      caption: total > 0 ? "Completed today" : "No appointments today",
    },
    {
      label: "Active Blocks",
      Icon: Ban,
      value: String(blocks.length),
      caption: blocks.length === 1 ? "Timeline block" : "Timeline blocks",
    },
    {
      label: "Queue Velocity Rate",
      Icon: Activity,
      value: `${attendanceRate}%`,
      caption: `Attendance Rate: ${attendanceRate}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpis.map(({ label, Icon, value, caption }) => (
        <div key={label} className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <p className="truncate text-xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p>
        </div>
      ))}
    </div>
  );
}
