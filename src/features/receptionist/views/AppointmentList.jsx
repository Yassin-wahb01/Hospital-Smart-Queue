import { Clock, XCircle, Edit, MoreVertical } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";

export default function AppointmentList({ appointments, onEdit, onCancel }) {
  const [openActionId, setOpenActionId] = useState(null);

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <Clock size={28} className="icon" />
        <p>No appointments found</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Appointments List</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600 }}>{a.patientName}</span>
                    <span style={{ fontSize: "var(--fs-xs)", color: "var(--clr-text-dim)" }}>
                      ID: {a.patientId}
                    </span>
                  </div>
                </td>
                <td>{a.doctorName}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td style={{ position: "relative" }}>
                  <button
                    className="actions-trigger"
                    onClick={() => setOpenActionId(openActionId === a._id ? null : a._id)}
                  >
                    <MoreVertical size={14} />
                  </button>
                  {openActionId === a._id && (
                    <div className="actions-menu">
                      <button
                        onClick={() => {
                          onEdit(a);
                          setOpenActionId(null);
                        }}
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => {
                          onCancel(a._id);
                          setOpenActionId(null);
                        }}
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
