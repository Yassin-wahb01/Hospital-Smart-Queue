import { useCallback, useEffect, useState } from "react";
import { LOCAL_UPDATE_EVENT, readCollection, STORAGE_KEYS, writeCollection } from "../utils/storage";

export default function useAppointments(doctorId, date) {
  const [all, setAll] = useState(() => readCollection(STORAGE_KEYS.appointments));

  const refresh = useCallback(() => {
    setAll(readCollection(STORAGE_KEYS.appointments));
  }, []);

  useEffect(() => {
    const onExternalChange = (e) => {
      if (e.key === STORAGE_KEYS.appointments) refresh();
    };
    const onLocalChange = (e) => {
      if (e.detail?.key === STORAGE_KEYS.appointments) refresh();
    };

    window.addEventListener("storage", onExternalChange);
    window.addEventListener(LOCAL_UPDATE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onExternalChange);
      window.removeEventListener(LOCAL_UPDATE_EVENT, onLocalChange);
    };
  }, [refresh]);

  const updateStatus = useCallback((appointmentId, status) => {
    const current = readCollection(STORAGE_KEYS.appointments);
    const next = current.map((appt) => (appt._id === appointmentId ? { ...appt, status } : appt));
    writeCollection(STORAGE_KEYS.appointments, next);
    setAll(next);
  }, []);

  const appointments = all
    .filter((a) => a.doctorId === doctorId && a.appointmentDate === date)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  return { appointments, updateStatus, refresh };
}
