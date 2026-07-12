import { Construction, LogOut } from "lucide-react";
import Logo from "./Logo";

// Generic "coming soon" screen for any role that doesn't have a real
// dashboard built yet (currently: patient, receptionist, admin). Once a
// role's dashboard is built, add it to the ROLE_DASHBOARDS map in App.jsx
// and this placeholder stops being used for that role.
export default function RolePlaceholder({ role, name, onSignOut }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
      <Logo compact />

      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Construction className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold capitalize">{role} dashboard</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Signed in as {name}. The {role} dashboard hasn't been built yet — check back soon.
        </p>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}