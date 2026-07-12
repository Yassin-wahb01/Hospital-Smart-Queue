import { useState } from "react";
import AuthPage from "../features/auth/AuthPage";
import DoctorDashboard from "../features/doctor-dashboard/DoctorDashboard";
import RolePlaceholder from "../components/RolePlaceholder";
import "./App.css";

// ⚠️ TEMP DEV PREVIEW BLOCK — remove once real routing (react-router or
// similar) is added. Visit the app with ?dashboard=1 in the URL to preview
// the Doctor Dashboard directly, e.g. http://localhost:5173/?dashboard=1
// Default behavior (AuthPage) is unchanged for everyone else.
const previewDashboard = new URLSearchParams(window.location.search).get("dashboard") === "1";
// ⚠️ END TEMP DEV PREVIEW BLOCK

// Add a role here once its real dashboard is built. Any role not listed
// falls back to RolePlaceholder so sign-in still works for every role
// even before its dashboard exists.
const ROLE_DASHBOARDS = {
  doctor: DoctorDashboard,
  // patient: PatientDashboard,
  // receptionist: ReceptionistDashboard,
  // admin: AdminDashboard,
};

function App() {
  // No real auth flow exists yet, so this session state is held in memory
  // and starts out "logged in" only for the ?dashboard=1 preview shortcut.
  // Once a real backend/auth is added, replace this with your actual
  // session/auth state (e.g. from a context, cookie, or token check).
  const [session, setSession] = useState(
    previewDashboard ? { role: "doctor", userId: "doc-001", name: "Dr. Sarah Youssef" } : null
  );

  const handleSignOut = () => setSession(null);

  if (session) {
    const Dashboard = ROLE_DASHBOARDS[session.role];

    if (!Dashboard) {
      return <RolePlaceholder role={session.role} name={session.name} onSignOut={handleSignOut} />;
    }

    // DoctorDashboard currently expects doctorId/doctorName specifically;
    // other future dashboards can just take userId/name directly instead.
    return (
      <Dashboard
        doctorId={session.userId}
        doctorName={session.name}
        onSignOut={handleSignOut}
      />
    );
  }

  return <AuthPage onSignInSuccess={(user) => setSession(user)} />;
}

export default App;