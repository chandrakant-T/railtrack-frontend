import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyComplaints } from '../../api/complaint.api';
import { getStatusColor, getPriorityColor, formatDate } from '../../utils/helpers';
import { Plus, Search, Eye } from 'lucide-react';

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
            <h1 className="text-2xl font-bold text-[#0B1F3A]">Welcome, {user?.name?.split(' ')[0]}</h1>
            <p className="text-gray-500 text-sm mt-1">Your complaint history and activity</p>
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
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#0B1F3A]">My complaints</h2>
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
              {complaints.map((c) => (
                <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[#0B1F3A]">{c.reference_id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(c.priority)}`}>{c.priority}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Train {c.train_number} · {c.complaint_type?.replace('_', ' ')} · {formatDate(c.filed_at)}
                    </p>
                  </div>
                  <Link to={`/track?ref=${c.reference_id}`} className="text-xs text-[#0B1F3A] hover:underline shrink-0">
                    Track →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;