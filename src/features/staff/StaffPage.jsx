import { useCallback, useEffect, useState } from 'react';
import { UserPlus, Pencil, Trash2, Search } from 'lucide-react';
import api from '../../services/api';
import StaffForm from './StaffForm';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';

const ROLE_BADGE = {
  admin:        'bg-purple-100 text-purple-700',
  doctor:       'bg-blue-100 text-blue-700',
  receptionist: 'bg-amber-100 text-amber-700',
};

export default function StaffPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';

  const [staff, setStaff]           = useState([]);
  const [departments, setDepts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [formTarget, setFormTarget] = useState(null);  // null | 'new' | staff object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null); // success info modal

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        api.get('/staff?limit=100'),
        api.get('/departments'),
      ]);
      setStaff(staffRes.data.users);
      setTotal(staffRes.data.total);
      setDepts(deptRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const deptName = (id) => departments.find((d) => d._id === id)?.name ?? '—';

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  async function confirmDelete() {
    try {
      const res = await api.delete(`/staff/${deleteTarget._id}`);
      setDeleteTarget(null);
      setDeleteResult(res.data); // { cancelledAppointments: n }
      fetchStaff();
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* ── Header ────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500">{total} total members</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormTarget('new')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <UserPlus className="h-4 w-4" /> Add Member
          </button>
        )}
      </div>

      {/* ── Search ────────────────────────────────── */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* ── Table ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">No staff members found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Name', 'Email', 'Role', 'Department', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[s.role]}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{deptName(s.departmentId)}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFormTarget(s)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Deactivate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ────────────────────────────────── */}
      {formTarget !== null && (
        <StaffForm
          existing={formTarget === 'new' ? null : formTarget}
          departments={departments}
          onSave={() => { setFormTarget(null); fetchStaff(); }}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Deactivate staff member?"
          message={`"${deleteTarget.name}" will be deactivated.${deleteTarget.role === 'doctor' ? ' All their future scheduled appointments will be cancelled.' : ''}`}
          confirmLabel="Deactivate"
          danger
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {deleteResult && (
        <ConfirmModal
          title="Staff member deactivated"
          message={`Done. ${deleteResult.cancelledAppointments} future appointment(s) were cancelled.`}
          onClose={() => setDeleteResult(null)}
        />
      )}
    </div>
  );
}
