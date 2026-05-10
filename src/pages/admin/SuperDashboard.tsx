import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import { getDashboardStats, getAllComplaints, manageVendorStatus } from '../../api/admin.api';
import { getAllVendors } from '../../api/vendor.api';
import { getStatusColor, getPriorityColor, getVendorStatusColor, formatDate } from '../../utils/helpers';
import { Users, AlertTriangle, ShieldOff, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [tab, setTab] = useState<'complaints' | 'vendors'>('complaints');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, cRes, vRes] = await Promise.all([
          getDashboardStats(),
          getAllComplaints({}),
          getAllVendors({})
        ]);
        setStats(sRes.data);
        setComplaints(cRes.data);
        setVendors(vRes.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVendorStatus = async (id: string, status: string) => {
    try {
      await manageVendorStatus(id, status);
      setVendors(vendors.map(v => v.id === id ? { ...v, status } : v));
      toast.success(`Vendor ${status}`);
    } catch {
      toast.error('Failed to update vendor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Super Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Full platform oversight and management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total vendors', value: stats?.total_vendors || 0, icon: <Users size={16} className="text-blue-600" />, bg: 'bg-blue-50', color: 'text-[#0B1F3A]' },
            { label: 'Total complaints', value: stats?.total_complaints || 0, icon: <AlertTriangle size={16} className="text-orange-600" />, bg: 'bg-orange-50', color: 'text-[#0B1F3A]' },
            { label: 'Resolution rate', value: `${stats?.resolution_rate || 0}%`, icon: <TrendingUp size={16} className="text-green-600" />, bg: 'bg-green-50', color: 'text-green-600' },
            { label: 'Blacklisted', value: stats?.blacklisted_vendors || 0, icon: <ShieldOff size={16} className="text-red-600" />, bg: 'bg-red-50', color: 'text-red-600' }
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className={`${s.bg} w-9 h-9 rounded-full flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['complaints', 'vendors'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium text-sm capitalize transition-colors ${tab === t ? 'bg-[#0B1F3A] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Complaints tab */}
        {tab === 'complaints' && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="bg-white rounded-xl p-16 text-center text-gray-400">Loading...</div>
            ) : complaints.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center text-gray-400">No complaints yet</div>
            ) : complaints.map((c) => (
              <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-5 ${c.priority === 'high' ? 'border-l-4 border-l-red-500 border-gray-100' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-semibold text-[#0B1F3A] text-sm">{c.reference_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                </div>
                <p className="text-gray-600 text-sm">Train {c.train_number} · {c.complaint_type?.replace('_', ' ')} · {c.vendor_name || 'Unknown vendor'}</p>
                <p className="text-gray-400 text-xs mt-1">{formatDate(c.filed_at)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vendors tab */}
        {tab === 'vendors' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Vendor</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Train / Type</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Complaints</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-400">Loading...</td></tr>
                ) : vendors.map((v) => (
                  <tr key={v.id} className="border-t border-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#0B1F3A]">{v.full_name}</p>
                      <p className="text-gray-400 text-xs">{v.vendor_code}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{v.train_number} · {v.vendor_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-medium ${v.complaint_count > 10 ? 'text-red-600' : 'text-gray-700'}`}>{v.complaint_count}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVendorStatusColor(v.status)}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {v.status !== 'active' && (
                          <button onClick={() => handleVendorStatus(v.id, 'active')} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Activate</button>
                        )}
                        {v.status !== 'suspended' && (
                          <button onClick={() => handleVendorStatus(v.id, 'suspended')} className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Suspend</button>
                        )}
                        {v.status !== 'blacklisted' && (
                          <button onClick={() => handleVendorStatus(v.id, 'blacklisted')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Blacklist</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;