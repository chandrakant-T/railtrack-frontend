import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { trackComplaint } from '../../api/complaint.api';
import { getStatusColor, getPriorityColor, formatDate } from '../../utils/helpers';
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const statusSteps = ['submitted', 'forwarded', 'acknowledged', 'resolved'];

const TrackComplaint = () => {
  const [searchParams] = useSearchParams();
  const [refId, setRefId] = useState(searchParams.get('ref') || '');
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('ref')) handleTrack();
  }, []);

  const handleTrack = async () => {
    if (!refId.trim()) return toast.error('Enter a reference ID');
    setLoading(true);
    try {
      const res = await trackComplaint(refId.trim());
      setComplaint(res.data);
    } catch {
      toast.error('Complaint not found');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = complaint ? statusSteps.indexOf(complaint.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">Track your complaint</h1>
        <p className="text-gray-500 text-sm mb-8">Enter your reference ID to check the status.</p>

        <div className="flex gap-3 mb-8">
          <input
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="e.g. RT-2026-08843"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
          />
          <button onClick={handleTrack} disabled={loading} className="bg-[#0B1F3A] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-900 disabled:opacity-60">
            <Search size={16} /> Track
          </button>
        </div>

        {complaint && (
          <div className="flex flex-col gap-4">
            {/* Reference ID card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-gray-400 text-sm mb-1">Reference ID</p>
              <p className="text-2xl font-bold text-[#0B1F3A] tracking-widest">{complaint.reference_id}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status.toUpperCase()}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>

            {/* Progress tracker */}
            {complaint.status !== 'rejected' && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-[#0B1F3A] mb-6">Complaint progress</h2>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-green-500 z-0 transition-all duration-500"
                    style={{ width: `${currentStep >= 0 ? (currentStep / (statusSteps.length - 1)) * 100 : 0}%` }}
                  />
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${i <= currentStep ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                        {i <= currentStep ? <CheckCircle size={16} /> : <Clock size={16} />}
                      </div>
                      <span className={`text-xs capitalize ${i <= currentStep ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complaint.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3 text-red-700">
                <XCircle size={20} />
                <div>
                  <p className="font-semibold">Complaint rejected</p>
                  <p className="text-sm text-red-500 mt-0.5">The station admin has reviewed and rejected this complaint.</p>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-[#0B1F3A] mb-4">Complaint details</h2>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: 'Complaint type', value: complaint.complaint_type?.replace('_', ' ') },
                  { label: 'Train number', value: complaint.train_number },
                  { label: 'Item', value: complaint.item_name || 'N/A' },
                  { label: 'Routed to', value: complaint.nearest_station || 'Routing...' },
                  { label: 'Filed at', value: formatDate(complaint.filed_at) },
                  { label: 'Resolved at', value: complaint.resolved_at ? formatDate(complaint.resolved_at) : 'Pending' }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-800 font-medium capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;