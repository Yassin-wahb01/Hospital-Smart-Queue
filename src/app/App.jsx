import AuthPage from "../features/auth/AuthPage";
import DoctorDashboard from "../features/doctor-dashboard/DoctorDashboard";
import "./App.css";

// ⚠️ TEMP DEV PREVIEW BLOCK — remove once real routing (react-router or
// similar) is added. Visit the app with ?dashboard=1 in the URL to preview
// the Doctor Dashboard directly, e.g. http://localhost:5173/?dashboard=1
// Default behavior (AuthPage) is unchanged for everyone else.
const previewDashboard = new URLSearchParams(window.location.search).get("dashboard") === "1";
// ⚠️ END TEMP DEV PREVIEW BLOCK

function App() {
  if (previewDashboard) {
    return <DoctorDashboard doctorId="doc-001" doctorName="Dr. Sarah Youssef" />;
  }

  return <AuthPage />;
}

export default App;