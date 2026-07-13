import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Calendar, Clock, CheckCircle, TrendingUp, RefreshCw, XCircle, Edit, Users, MoreVertical } from "lucide-react";
import DashboardHeader from "../../components/DashboardHeader";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import useDarkMode from "../../hooks/useDarkMode";
import ConfirmModal from "../../components/ConfirmModal";
import AppointmentModal from "./components/AppointmentModal";
import ReceptionistSidebar from "./components/ReceptionistSidebar";
import { receptionistApi } from "../../services/receptionistApi";

export default function ReceptionistDashboard({ receptionistId, receptionistName, onSignOut }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { message, title, variant, showToast, hideToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptData, docData] = await Promise.all([
        receptionistApi.getAppointments(),
        receptionistApi.getDoctors(),
      ]);
      setAppointments(apptData);
      setDoctors(docData);
    } catch (err) {
      showToast("Failed to load data", { title: "Error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData) => {
    try {
      if (editingAppointment) {
        await receptionistApi.updateAppointment(editingAppointment._id, formData);
        showToast("Appointment updated", { title: "Success", variant: "success" });
      } else {
        await receptionistApi.createAppointment(formData);
        showToast("Appointment created", { title: "Success", variant: "success" });
      }
      setModalOpen(false);
      setEditingAppointment(null);
      fetchData();
    } catch (err) {
      showToast("Operation failed", { title: "Error", variant: "error" });
    }
  };

  const handleCancel = async () => {
    try {
      await receptionistApi.cancelAppointment(cancelTarget);
      showToast("Appointment cancelled", { title: "Success", variant: "info" });
      setCancelTarget(null);
      fetchData();
    } catch (err) {
      showToast("Cancel failed", { title: "Error", variant: "error" });
    }
  };

  const filtered = appointments
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        searchQuery === "" ||
        a.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const kpis = [
    { label: "Total", value: appointments.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Waiting", value: appointments.filter((a) => a.status === "waiting").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "In Progress", value: appointments.filter((a) => a.status === "in-progress").length, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toast message={message} title={title} variant={variant} onClose={hideToast} />

      <ReceptionistSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={sidebarOpen}
        receptionistName={receptionistName}
        onSignOut={onSignOut}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
          name={receptionistName}
          role="Receptionist"
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Loading data...
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${kpi.bg}`}>
                        <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                        <h3 className="text-2xl font-bold">{kpi.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Search patients..."
                      className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-1 rounded-lg bg-muted p-1">
                    {["all", "waiting", "in-progress", "completed", "cancelled"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                          filter === f
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button onClick={fetchData} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingAppointment(null);
                      setModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" /> New Appointment
                  </button>
                </div>
              </div>

              {/* Grid View */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                  <Calendar className="mb-4 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-lg font-medium">No appointments found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((apt) => (
                    <div key={apt._id} className="relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{apt.patientName}</h4>
                            <p className="text-xs text-muted-foreground">ID: {apt.patientId}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                             apt.status === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" :
                             apt.status === "in-progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                             apt.status === "waiting" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                             "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                           }`}>
                             {apt.status}
                           </span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{apt.date} at {apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" /> {/* Should be Stethoscope but keeping it simple */}
                          <span>Dr. {apt.doctorName}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2 border-t border-border pt-4">
                        <button
                          onClick={() => {
                            setEditingAppointment(apt);
                            setModalOpen(true);
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-1.5 text-sm hover:bg-muted"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => setCancelTarget(apt._id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-destructive/20 text-destructive py-1.5 text-sm hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleSubmit}
        appointment={editingAppointment}
        doctors={doctors}
      />

      {!!cancelTarget && (
        <ConfirmModal
          title="Cancel Appointment?"
          message="This will change the appointment status to cancelled."
          confirmLabel="Cancel Appointment"
          danger={true}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
