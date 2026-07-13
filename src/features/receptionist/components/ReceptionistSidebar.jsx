import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import Logo from "../../../components/Logo";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Patients", icon: Users },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "queue", label: "Queue", icon: Clock },
];

export default function ReceptionistSidebar({
  activeView,
  onNavigate,
  isOpen,
  receptionistName,
  onSignOut,
}) {
  return (
    <aside
      className={`shrink-0 overflow-hidden border-r border-border bg-muted/60 transition-all duration-200 ${
        isOpen ? "w-60" : "w-0 border-r-0"
      }`}
    >
      <div className="flex h-full w-60 flex-col">
        <div className="border-b border-border p-5">
          <Logo compact subtitle="Receptionist" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </p>
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 mt-auto">
          <div className="mb-2 px-3 py-1.5 leading-tight">
            <p className="text-sm font-semibold text-foreground truncate">{receptionistName}</p>
            <p className="text-xs text-muted-foreground capitalize">Receptionist</p>
          </div>
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
