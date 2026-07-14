import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Fetches the authenticated doctor's appointments from the real backend.
 *
 * GET /appointments scopes automatically to the logged-in doctor when
 * role === 'doctor' (see appointmentController.js list()).
 *
 * Normalises the backend shape → the fields the existing doctor-dashboard
 * views already expect (patientName, appointmentDate, timeSlot, queueNumber)
 * so those components need zero field-name changes.
 */
export default function useDoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments?limit=200');
      const raw = data.appointments ?? [];

      // Chronological sort → queueNumber = position in daily order
      const sorted = [...raw].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      const normalised = sorted.map((appt, i) => ({
        ...appt,
        // Derived fields that views rely on
        patientName: appt.patientId?.name ?? '—',
        appointmentDate: appt.dateTime.slice(0, 10),
        timeSlot: new Date(appt.dateTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        queueNumber: i + 1,
      }));

      setAppointments(normalised);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateStatus = useCallback(async (appointmentId, status) => {
    await api.put(`/appointments/${appointmentId}`, { status });
    await refresh();
  }, [refresh]);

  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter((a) => a.appointmentDate === today);

  return { appointments, todayAppointments, loading, error, refresh, updateStatus };
}
