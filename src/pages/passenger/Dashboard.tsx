import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyComplaints } from '../../api/complaint.api';
import { getStatusColor, getPriorityColor, formatDate, formatCurrency } from '../../utils/helpers';
import { Plus, Search, Eye, Zap, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'complaints' | 'payments'>('complaints');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          getMyComplaints().catch(() => ({ data: [] })),
          api.get('/payments/my-history').catch(() => ({ data: [] }))
        ]);
        setComplaints(cRes.data || []);
        setPayments(pRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Welcome, {user?.name?.split(' ')[0] || 'Passenger'}</h1>
            <p className="text-gray-500 text-sm mt-1">Your UPI transaction history, telemetry & AI dispute logs</p>
          </div>
          <Link to="/complaint" className="bg-[#0B1F3A] text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-900 text-sm">
            <Plus size={16} /> New complaint
          </Link>
        </div>

        {/* Quick Actions */}
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

        {/* Dashboard Section Tabs */}
        <div className="flex gap-3 mb-6 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-2 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'complaints'
                ? 'border-[#0B1F3A] text-[#0B1F3A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <AlertCircle size={16} /> My Complaints ({complaints.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'payments'
                ? 'border-[#0B1F3A] text-[#0B1F3A]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <CreditCard size={16} /> Payment & Receipt History ({payments.length})
          </button>
        </div>

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-gray-400">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-gray-400 mb-3">No complaints filed yet</p>
                <Link to="/complaint" className="text-sm text-[#0B1F3A] font-medium hover:underline">File your first complaint →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {complaints.map((c) => {
                  const hasOvercharge = c.charged_price && c.irctc_price && c.charged_price > c.irctc_price;
                  const refundAmount = hasOvercharge ? (c.charged_price - c.irctc_price).toFixed(2) : null;

                  return (
                    <div key={c.id} className="p-6 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-bold text-[#0B1F3A] text-sm">{c.reference_id}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${getStatusColor(c.status)}`}>{c.status}</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${getPriorityColor(c.priority)}`}>{c.priority}</span>

                          {/* Autonomous AI Refund Badge */}
                          {hasOvercharge && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Zap size={12} className="fill-emerald-600 text-emerald-600" /> ₹{refundAmount} AI Refunded
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-xs flex items-center gap-2 flex-wrap mb-1">
                          <span>Train {c.train_number}</span>
                          <span>·</span>
                          <span className="capitalize">{c.complaint_type?.replace('_', ' ')}</span>
                          {c.item_name && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-gray-800">{c.item_name}</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{formatDate(c.filed_at)}</span>
                        </p>

                        {/* Payment Telemetry Line */}
                        <div className="mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-gray-700 flex items-center gap-1">
                            <CreditCard size={13} className="text-gray-400" />
                            Payment ID: <strong className="text-gray-900 bg-white px-1.5 py-0.5 rounded border">{c.payment_id || 'Not linked'}</strong>
                          </span>
                          {c.charged_price && (
                            <span>Charged: <strong>₹{c.charged_price}</strong> (Official MRP: ₹{c.irctc_price || 'N/A'})</span>
                          )}
                        </div>
                      </div>

                      <Link to={`/track?ref=${c.reference_id}`} className="text-xs text-[#0B1F3A] font-semibold shrink-0 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                        Track →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT HISTORY TAB */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {payments.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No payment receipts recorded on this account yet.</p>
                <p className="text-xs text-gray-400 mt-1">Payments made via vendor QR codes will automatically appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.map((p) => {
                  const formattedPayId = p.payment_id?.startsWith('pay_') ? p.payment_id : `pay_${p.payment_id || p.receipt_id}`;

                  return (
                    <div key={p.id || p.receipt_id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm text-[#0B1F3A] bg-gray-100 px-2 py-0.5 rounded">
                            {formattedPayId}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Vendor: <strong>{p.vendor_name || 'Railway Vendor'}</strong> · Item: <strong>{p.item_name || 'Food Item'}</strong>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Paid on {formatDate(p.created_at || new Date())}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-emerald-700">₹{p.amount || p.total_paid}</p>
                        <button
                          onClick={() => {
                            navigate(`/complaint?paymentId=${formattedPayId}&amount=${p.amount || p.total_paid}&item=${encodeURIComponent(p.item_name || '')}`);
                          }}
                          className="mt-1 text-xs text-red-600 hover:text-red-800 font-semibold underline flex items-center gap-1"
                        >
                          <AlertCircle size={12} /> Report Overcharge
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDashboard;