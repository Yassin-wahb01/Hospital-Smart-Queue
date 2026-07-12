// Shared localStorage helpers for the `appointments` and `blockTime`
// collections. Every feature that reads or writes these keys should go
// through here so the schema and cross-tab/same-tab sync stay in one
// place. Per the project's `boundaries/dependencies` ESLint rule, `utils`
// cannot import from anything else — keep this file dependency-free.

export const STORAGE_KEYS = {
  appointments: "appointments",
  blockTime: "blockTime",
};

// Native "storage" events only fire in *other* tabs, not the one that made
// the change, so we also dispatch this custom event to keep hooks in the
// same tab in sync.
export const LOCAL_UPDATE_EVENT = "medicare:local-storage-update";

export function readCollection(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCollection(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(LOCAL_UPDATE_EVENT, { detail: { key } }));
}

export function todayISODate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Appointment shape (data dictionary):
 * {
 *   _id: string,
 *   patientName: string,
 *   queueNumber: number,
 *   complaint: string,
 *   doctorId: string,
 *   doctorName: string,
 *   appointmentDate: string,   // "YYYY-MM-DD"
 *   timeSlot: string,          // "HH:mm"
 *   type: "Walk-in" | "Phone" | "Online",
 *   status: "confirmed" | "pending" | "completed" | "cancelled",
 * }
 *
 * BlockTime shape:
 * {
 *   date: string,        // "YYYY-MM-DD"
 *   startTime: string,   // "HH:mm"
 *   endTime: string,     // "HH:mm"
 *   reason: string,
 *   doctorId?: string,   // added so one shared collection can serve multiple doctors
 * }
 */
