import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { getStationComplaints, updateComplaintStatus } from '../../api/complaint.api';
import { getDashboardStats } from '../../api/admin.api';
import { getStatusColor, getPriorityColor, formatDate } from '../../utils/helpers';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const StationAdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        getStationComplaints({}),
        getDashboardStats()
      ]);
      setComplaints(cRes.data);
      setStats(sRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: string, note?: string) => {
    setUpdating(id);
    try {
      await updateComplaintStatus(id, { status, note: note || '' });
      fetchData();
      toast.success(`Complaint marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleEscalate = async (id: string) => {
    setUpdating(id);
    try {
      await axios.post(`/api/complaints/${id}/escalate`);
      fetchData();
      toast.success('Complaint escalated & re-emailed to RPF/GRP');
    } catch {
      toast.error('Failed to escalate complaint');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const pending = complaints.filter(c => !['resolved', 'rejected'].includes(c.status)).length;
  const high = complaints.filter(c => c.priority === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Station Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming complaints for your station</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total complaints', value: complaints.length, color: 'text-[#0B1F3A]', bg: 'bg-blue-50', icon: <AlertTriangle size={16} className="text-blue-600" /> },
            { label: 'Pending', value: pending, color: 'text-orange-600', bg: 'bg-orange-50', icon: <Clock size={16} className="text-orange-600" /> },
            { label: 'High priority', value: high, color: 'text-red-600', bg: 'bg-red-50', icon: <AlertTriangle size={16} className="text-red-600" /> },
            { label: 'Resolved', value: stats?.resolved_complaints || 0, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16} className="text-green-600" /> }
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className={`${s.bg} w-9 h-9 rounded-full flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'submitted', 'forwarded', 'acknowledged', 'resolved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-[#0B1F3A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Complaints list */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400">No complaints found</div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${c.priority === 'high' ? 'border-l-4 border-l-red-500 border-gray-100' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-[#0B1F3A]">{c.reference_id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                      {c.complaint_type === 'cash_demand' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Cash demand</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Train:</span> {c.train_number}
                      {c.coach_number && <> · <span className="font-medium">Coach:</span> {c.coach_number}</>}
                      {c.vendor_name && <> · <span className="font-medium">Vendor:</span> {c.vendor_name}</>}
                    </p>
                    {c.item_name && (
                      <p className="text-gray-500 text-sm mt-0.5">
                        {c.item_name} — IRCTC ₹{c.irctc_price} · Charged ₹{c.charged_price}
                      </p>
                    )}
                    {c.description && <p className="text-gray-400 text-sm mt-1 italic">"{c.description}"</p>}
                    <p className="text-gray-400 text-xs mt-2">{formatDate(c.filed_at)}</p>

                    {/* Audit trail */}
                    {c.complaint_logs && c.complaint_logs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <p className="text-xs text-gray-400 mb-1 font-medium">Audit trail:</p>
                        {c.complaint_logs.map((log: any, i: number) => (
                          <p key={i} className="text-xs text-gray-400">
                            → {log.old_status} to {log.new_status}
                            {log.note && ` — "${log.note}"`}
                            · {formatDate(log.updated_at)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {!['resolved', 'rejected'].includes(c.status) && (
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      {(c.status === 'submitted' || c.status === 'forwarded') && (
                        <button
                          disabled={updating === c.id}
                          onClick={() => handleStatus(c.id, 'acknowledged')}
                          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 disabled:opacity-60"
                        >
                          <Clock size={13} /> Acknowledge
                        </button>
                      )}
                      {(c.complaint_type === 'cash_demand' || c.priority === 'high') && (
                        <button
                          disabled={updating === c.id}
                          onClick={() => handleEscalate(c.id)}
                          className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-100 disabled:opacity-60"
                        >
                          <AlertTriangle size={13} /> Escalate to RPF
                        </button>
                      )}
                      <button
                        disabled={updating === c.id}
                        onClick={() => setResolvingId(c.id)}
                        className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-60"
                      >
                        <CheckCircle size={13} /> Resolve
                      </button>
                      <button
                        disabled={updating === c.id}
                        onClick={() => setRejectingId(c.id)}
                        className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-60"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Confirmation Modal */}
      {resolvingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-[#0B1F3A] text-lg mb-2">Resolve complaint</h2>
            <p className="text-gray-500 text-sm mb-4">
              You must provide details of the action taken. This note is permanent and visible to Super Admin.
            </p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Describe exactly what action was taken e.g. 'Vendor warned and fined ₹500. Passenger refunded the excess ₹6.'"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0B1F3A] resize-none mb-4"
            />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
              ⚠️ False resolution is a disciplinary offense. All resolution notes are logged with your account ID and timestamp.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setResolvingId(null); setResolveNote(''); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={!resolveNote.trim() || resolveNote.trim().length < 20}
                onClick={async () => {
                  if (!resolveNote.trim() || resolveNote.trim().length < 20) {
                    return toast.error('Please provide a detailed resolution note (min 20 characters)');
                  }
                  await handleStatus(resolvingId, 'resolved', resolveNote);
                  setResolvingId(null);
                  setResolveNote('');
                }}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-40"
              >
                Confirm resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Confirmation Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-[#0B1F3A] text-lg mb-2">Reject complaint</h2>
            <p className="text-gray-500 text-sm mb-4">
              Please state the clear reason for rejecting this complaint. This reason is logged permanently.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Provide reason for rejection e.g. 'Invalid train details provided or unverified claim.'"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0B1F3A] resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectingId(null); setRejectNote(''); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={!rejectNote.trim()}
                onClick={async () => {
                  if (!rejectNote.trim()) {
                    return toast.error('Please provide a reason for rejection');
                  }
                  await handleStatus(rejectingId, 'rejected', rejectNote);
                  setRejectingId(null);
                  setRejectNote('');
                }}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 disabled:opacity-40"
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationAdminDashboard;