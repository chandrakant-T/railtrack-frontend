import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { getStationComplaints, updateComplaintStatus } from '../../api/complaint.api';
import { getDashboardStats } from '../../api/admin.api';
import { getStatusColor, getPriorityColor, formatDate } from '../../utils/helpers';
import { CheckCircle, XCircle, AlertTriangle, Clock, Zap, CreditCard, Eye, ShieldAlert, Phone, Package, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const StationAdminDashboard = () => {
  const { user } = useAuth();
  const stationCode = (user as (typeof user & { station_code?: string }) | null)?.station_code;
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        getStationComplaints({}),
        getDashboardStats()
      ]);
      setComplaints(cRes.data || []);
      setStats(sRes.data || null);
    } catch {
      toast.error('Failed to load station data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: string, note?: string) => {
    setUpdating(id);
    try {
      await updateComplaintStatus(id, { status, note: note || '' });
      await fetchData();
      toast.success(`Complaint marked as ${status}`);
    } catch {
      toast.error('Failed to update complaint status');
    } finally {
      setUpdating(null);
    }
  };

  const handleEscalate = async (id: string) => {
    setUpdating(id);
    try {
      await api.post(`/complaints/${id}/escalate`);
      await fetchData();
      toast.success('Complaint escalated & forwarded directly to local RPF/GRP unit!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to escalate complaint to RPF');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const pending = complaints.filter(c => !['resolved', 'rejected'].includes(c.status)).length;
  const high = complaints.filter(c => c.priority === 'high' || c.complaint_type === 'cash_demand').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Station Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Manage, inspect, and route station-level passenger disputes</p>
          </div>
          {stationCode && (
            <span className="bg-[#0B1F3A] text-[#F5A623] px-3 py-1.5 rounded-lg text-xs font-bold font-mono shadow-sm">
              STATION: {stationCode}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total complaints', value: complaints.length, color: 'text-[#0B1F3A]', bg: 'bg-blue-50', icon: <AlertTriangle size={16} className="text-blue-600" /> },
            { label: 'Pending action', value: pending, color: 'text-orange-600', bg: 'bg-orange-50', icon: <Clock size={16} className="text-orange-600" /> },
            { label: 'High priority / RPF', value: high, color: 'text-red-600', bg: 'bg-red-50', icon: <ShieldAlert size={16} className="text-red-600" /> },
            { label: 'Resolved cases', value: stats?.resolved_complaints || complaints.filter(c => c.status === 'resolved').length, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16} className="text-green-600" /> }
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className={`${s.bg} w-9 h-9 rounded-full flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
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

        {/* Complaints List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400 border border-gray-100">Loading station complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400 border border-gray-100">No complaints found under this status</div>
          ) : (
            filtered.map((c) => {
              const isRefunded = c.refund_status === 'refunded' || (c.refund_amount && Number(c.refund_amount) > 0);
const refundAmount = isRefunded ? Number(c.refund_amount).toFixed(2) : null;

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${c.priority === 'high' || c.complaint_type === 'cash_demand' ? 'border-l-4 border-l-red-500 border-gray-100' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-[#0B1F3A] text-sm">{c.reference_id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                        {c.complaint_type === 'cash_demand' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                            <ShieldAlert size={12} /> Cash demand
                          </span>
                        )}

                        {/* Autonomous AI Refund Badge */}
                        {isRefunded && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Zap size={12} className="fill-emerald-600 text-emerald-600" /> ₹{refundAmount} AI Refunded
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Train:</span> {c.train_number}
                        {c.coach_number && <> · <span className="font-medium">Coach:</span> {c.coach_number}</>}
                        {c.vendor_name && <> · <span className="font-medium">Vendor:</span> {c.vendor_name}</>}
                      </p>

                      {c.item_name && (
                        <p className="text-gray-500 text-sm mt-0.5">
                          {c.item_name} — IRCTC ₹{c.irctc_price || 'N/A'} · Charged ₹{c.charged_price || 'N/A'}
                        </p>
                      )}

                      {c.payment_id && (
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                          <CreditCard size={12} /> Payment ID: <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border">{c.payment_id}</span>
                        </p>
                      )}

                      {c.description && <p className="text-gray-500 text-sm mt-1 italic">"{c.description}"</p>}
                      <p className="text-gray-400 text-xs mt-2">{formatDate(c.filed_at)}</p>

                      {/* Audit Trail */}
                      {c.complaint_logs && c.complaint_logs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-400 mb-1 font-medium">Audit trail:</p>
                          {c.complaint_logs.map((log: any, i: number) => (
                            <p key={i} className="text-xs text-gray-400">
                              → {log.old_status || 'submitted'} to <span className="font-medium text-gray-600">{log.new_status}</span>
                              {log.note && ` — "${log.note}"`}
                              · {formatDate(log.updated_at)}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0 flex-wrap items-center">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Eye size={13} /> Details
                      </button>

                      {!['resolved', 'rejected'].includes(c.status) && (
                        <>
                          {(c.status === 'submitted' || c.status === 'forwarded') && (
                            <button
                              disabled={updating === c.id}
                              onClick={() => handleStatus(c.id, 'acknowledged')}
                              className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100 disabled:opacity-60 transition-colors"
                            >
                              <Clock size={13} /> Acknowledge
                            </button>
                          )}
                          <button
                            disabled={updating === c.id}
                            onClick={() => handleEscalate(c.id)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors"
                          >
                            <ShieldAlert size={13} /> Escalate to RPF
                          </button>
                          <button
                            disabled={updating === c.id}
                            onClick={() => setResolvingId(c.id)}
                            className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-60 transition-colors"
                          >
                            <CheckCircle size={13} /> Resolve
                          </button>
                          <button
                            disabled={updating === c.id}
                            onClick={() => setRejectingId(c.id)}
                            className="flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 disabled:opacity-60 transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full Details Inspection Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">Complaint Inspection</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Reference ID: {selectedComplaint.reference_id}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(selectedComplaint.status)}`}>
                {selectedComplaint.status}
              </span>
            </div>

            <div className="space-y-4 my-5 text-sm max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-900 font-bold flex items-center gap-1.5 mb-1">
                  <Package size={14} className="text-blue-700" /> Item & Purchasing Telemetry
                </p>
                <p className="font-semibold text-gray-900">{selectedComplaint.item_name || 'Item Not Specified'}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2 pt-2 border-t border-blue-100/80">
                  <span>Price Charged: <strong className="text-gray-900">₹{selectedComplaint.charged_price || 'N/A'}</strong></span>
                  <span>Official IRCTC MRP: <strong className="text-gray-900">₹{selectedComplaint.irctc_price || 'N/A'}</strong></span>
                </div>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 mb-1">
                  <CreditCard size={14} className="text-gray-600" /> Gateway & Payment Details
                </p>
                <p className="font-mono text-xs text-gray-800 bg-white p-2 rounded border border-gray-200 break-all">
                  {selectedComplaint.payment_id || 'No Razorpay ID attached (Cash or Manual Entry)'}
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 mb-1">
                  <Phone size={14} className="text-gray-600" /> Passenger Contact
                </p>
                <p className="font-medium text-gray-800">{selectedComplaint.passenger_phone || 'No phone provided'}</p>
              </div>

              {selectedComplaint.description && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Passenger Statement</p>
                  <p className="text-gray-700 text-xs italic">"{selectedComplaint.description}"</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedComplaint(null)}
              className="w-full bg-[#0B1F3A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-900 transition-colors"
            >
              Close Inspection Window
            </button>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-[#0B1F3A] text-lg mb-2">Resolve complaint</h2>
            <p className="text-gray-500 text-sm mb-4">
              Provide specific details of the action taken. This note is permanently stored in the audit trail.
            </p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Describe exact action taken e.g. 'Vendor inspected on Train 12951, issued official warning & penalized ₹500.'"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0B1F3A] resize-none mb-4"
            />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
              ⚠️ Resolution notes are permanently logged with your station admin account ID.
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
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
              >
                Confirm resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-[#0B1F3A] text-lg mb-2">Reject complaint</h2>
            <p className="text-gray-500 text-sm mb-4">
              State the reason for rejecting this complaint.
            </p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Provide reason e.g. 'Unverifiable transaction details or duplicate entry submitted.'"
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
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 disabled:opacity-40 transition-colors"
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