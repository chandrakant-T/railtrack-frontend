import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { getVendorsByTrain } from '../../api/vendor.api';
import { Search, AlertTriangle, Star, ChevronRight, Train, CreditCard } from 'lucide-react';
import { getVendorStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TrainSearch = () => {
  const [searchParams] = useSearchParams();
  const [trainNumber, setTrainNumber] = useState(searchParams.get('train') || '');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('train')) handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!trainNumber.trim()) return toast.error('Enter a train number');
    setLoading(true);
    setSearched(true);
    try {
      const res = await getVendorsByTrain(trainNumber.trim());
      setVendors(res.data);
    } catch {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">Search train vendors</h1>
        <p className="text-gray-500 text-sm mb-8">Enter your train number to see all active vendors, their items, and official prices.</p>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={trainNumber}
            onChange={(e) => setTrainNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter train number (e.g. 12951)"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#0B1F3A] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-900 disabled:opacity-60"
          >
            <Search size={16} /> {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">Fetching vendors...</div>
        )}

        {!loading && searched && vendors.length === 0 && (
          <div className="text-center py-16">
            <Train size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No vendors found for train {trainNumber}</p>
            <p className="text-gray-400 text-sm mt-1">The train may not have registered vendors yet</p>
            <Link to="/complaint" className="inline-block mt-4 text-sm text-red-600 hover:underline">
              Report an unlisted vendor →
            </Link>
          </div>
        )}

        {!loading && vendors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {vendors.length} vendor{vendors.length > 1 ? 's' : ''} found on train {trainNumber}
              </p>
              <Link to="/complaint" className="text-sm text-red-600 hover:underline flex items-center gap-1">
                <AlertTriangle size={13} /> Report unlisted vendor
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-[#0B1F3A] text-[#F5A623] flex items-center justify-center font-semibold text-sm shrink-0">
                    {vendor.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#0B1F3A]">{vendor.full_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVendorStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                      {vendor.complaint_count > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
                          {vendor.complaint_count} complaints
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {vendor.vendor_type.replace('_', ' ')} · Coach {vendor.coach_number} · {vendor.vendor_code}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-700 mr-1">
                      <Star size={13} fill="currentColor" /> {vendor.rating}
                    </div>

                    {/* Pay button */}
                    {vendor.status === 'active' && (
                      <Link
                        to={`/pay/${vendor.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#F5A623] text-[#0B1F3A] text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-400 transition-colors flex items-center gap-1"
                      >
                        <CreditCard size={12} /> Pay
                      </Link>
                    )}

                    {/* View profile */}
                    <Link
                      to={`/vendor/${vendor.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Info banner */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <CreditCard size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-700 font-medium text-sm">Pay directly via UPI</p>
                <p className="text-blue-500 text-xs mt-0.5">
                  Click Pay on any vendor to select items and pay via Razorpay UPI. Every transaction is recorded and receipts are auto-generated.
                  Cash payments are not allowed — report any vendor demanding cash instantly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainSearch;