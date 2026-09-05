import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyComplaints } from '../../api/complaint.api';
import { getStatusColor, getPriorityColor, formatDate } from '../../utils/helpers';
import { Plus, Search, Eye, Zap, CreditCard } from 'lucide-react';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyComplaints()
      .then((res) => setComplaints(res.data))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Welcome, {user?.name?.split(' ')[0] || 'Passenger'}</h1>
            <p className="text-gray-500 text-sm mt-1">Your complaint history, payment telemetry & AI refund logs</p>
          </div>
          <Link to="/complaint" className="bg-[#0B1F3A] text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-900 text-sm">
            <Plus size={16} /> New complaint
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Search vendors', desc: 'Find vendors on your train', to: '/search', icon: <Search size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
            { label: 'File complaint', desc: 'Report overcharging or cash demand', to: '/complaint', icon: <Plus size={18} className="text-red-600" />, bg: 'bg-red-50' },
            { label: 'Track complaint', desc: 'Check complaint status', to: '/track', icon: <Eye size={18} className="text-green-600" />, bg: 'bg-green-50' }
          ].map((action) => (
            <Link key={action.label} to={action.to} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className={`${action.bg} w-9 h-9 rounded-full flex items-center justify-center mb-3`}>{action.icon}</div>
              <p className="font-semibold text-[#0B1F3A] text-sm">{action.label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Complaint history */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#0B1F3A]">My complaints</h2>
            <span className="text-xs text-gray-400">{complaints.length} Records</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : complaints.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 mb-3">No complaints filed yet</p>
              <Link to="/complaint" className="text-sm text-[#0B1F3A] font-medium hover:underline">File your first complaint →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {complaints.map((c) => {
                const isRefunded = c.charged_price && c.irctc_price && c.charged_price > c.irctc_price && c.payment_id;
                const refundAmount = isRefunded ? (c.charged_price - c.irctc_price).toFixed(2) : null;

                return (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm text-[#0B1F3A]">{c.reference_id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(c.priority)}`}>{c.priority}</span>

                        {/* Autonomous AI Refund Badge */}
                        {isRefunded && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Zap size={12} className="fill-emerald-600 text-emerald-600" /> ₹{refundAmount} AI Refunded
                          </span>
                        )}
                      </div>

                      <p className="text-gray-500 text-xs flex items-center gap-2 flex-wrap">
                        <span>Train {c.train_number}</span>
                        <span>·</span>
                        <span className="capitalize">{c.complaint_type?.replace('_', ' ')}</span>
                        {c.item_name && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-gray-700">{c.item_name}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDate(c.filed_at)}</span>
                      </p>

                      {/* Payment ID Telemetry details */}
                      {c.payment_id && (
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                          <CreditCard size={12} className="text-gray-400" />
                          Payment Ref: <span className="bg-gray-100 text-gray-600 px-1 rounded">{c.payment_id}</span>
                          {c.charged_price && <span>(Charged: ₹{c.charged_price} | MRP: ₹{c.irctc_price || 'N/A'})</span>}
                        </p>
                      )}
                    </div>

                    <Link to={`/track?ref=${c.reference_id}`} className="text-xs text-[#0B1F3A] font-semibold hover:underline shrink-0 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                      Track →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;