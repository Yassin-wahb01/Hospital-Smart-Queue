import { Ban, CalendarClock, ClipboardList, LayoutDashboard } from "lucide-react";
import Logo from "../../../components/Logo";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "schedule", label: "Daily Schedule", Icon: CalendarClock },
  { id: "appointments", label: "Appointments", Icon: ClipboardList },
  { id: "blocktime", label: "Block Time", Icon: Ban },
];

export default function DashboardSidebar({ activeView, onNavigate, doctorName }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-border bg-card md:h-screen md:w-64 md:border-r">
      <div className="border-b border-border p-5">
        <Logo compact />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs font-semibold text-foreground">{doctorName}</p>
        <p className="text-xs text-muted-foreground">Attending physician</p>
      </div>
    </aside>
  );
}
