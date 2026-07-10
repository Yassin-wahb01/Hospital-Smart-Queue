import { readCollection, writeCollection, STORAGE_KEYS, todayISODate } from "../../utils/storage";

// Fake "today's schedule" so the dashboard has something real to look at
// out of the box. This is intentionally idempotent and additive:
//   - It only runs if THIS doctor has zero appointments for today.
//   - It appends to the shared `appointments` collection rather than
//     replacing it, so it never overwrites teammates' data or real bookings.
//   - IDs are prefixed with the doctorId so they can't collide with real
//     records once a booking flow exists.
// Safe to delete this file (and its one call site in DoctorDashboard.jsx)
// once real appointment data is coming from a backend.
export function seedDemoScheduleIfEmpty(doctorId, doctorName) {
  const today = todayISODate();
  const existingAppointments = readCollection(STORAGE_KEYS.appointments);
  const doctorAlreadyHasToday = existingAppointments.some(
    (a) => a.doctorId === doctorId && a.appointmentDate === today
  );

  if (!doctorAlreadyHasToday) {
    const demoAppointments = [
      {
        _id: `${doctorId}-demo-1`,
        patientName: "Youssef Adel",
        queueNumber: 1,
        complaint: "Follow-up: blood pressure check",
        doctorId,
        doctorName,
        appointmentDate: today,
        timeSlot: "09:00",
        type: "Walk-in",
        status: "completed",
      },
      {
        _id: `${doctorId}-demo-2`,
        patientName: "Mona Farouk",
        queueNumber: 2,
        complaint: "Persistent headache, 3 days",
        doctorId,
        doctorName,
        appointmentDate: today,
        timeSlot: "09:30",
        type: "Online",
        status: "confirmed",
      },
      {
        _id: `${doctorId}-demo-3`,
        patientName: "Karim Hossam",
        queueNumber: 3,
        complaint: "Annual physical",
        doctorId,
        doctorName,
        appointmentDate: today,
        timeSlot: "10:00",
        type: "Phone",
        status: "pending",
      },
      {
        _id: `${doctorId}-demo-4`,
        patientName: "Laila Nabil",
        queueNumber: 4,
        complaint: "Skin rash on forearm",
        doctorId,
        doctorName,
        appointmentDate: today,
        timeSlot: "10:30",
        type: "Walk-in",
        status: "confirmed",
      },
      {
        _id: `${doctorId}-demo-5`,
        patientName: "Omar Tarek",
        queueNumber: 5,
        complaint: "Missed last week's slot",
        doctorId,
        doctorName,
        appointmentDate: today,
        timeSlot: "11:00",
        type: "Online",
        status: "cancelled",
      },
    ];

    writeCollection(STORAGE_KEYS.appointments, [...existingAppointments, ...demoAppointments]);
  }

  const existingBlocks = readCollection(STORAGE_KEYS.blockTime);
  const doctorAlreadyHasBlockToday = existingBlocks.some(
    (b) => b.doctorId === doctorId && b.date === today
  );

  if (!doctorAlreadyHasBlockToday) {
    writeCollection(STORAGE_KEYS.blockTime, [
      ...existingBlocks,
      { date: today, startTime: "13:00", endTime: "14:00", reason: "Lunch break", doctorId },
    ]);
  }
}
