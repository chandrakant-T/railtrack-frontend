import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { getVendorById } from '../../api/vendor.api';
import { getVendorInventory } from '../../api/inventory.api';
import { AlertTriangle, Star, Package, ShieldAlert , CreditCard } from 'lucide-react';
import { getVendorStatusColor, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const VendorProfile = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, iRes] = await Promise.all([
          getVendorById(id!),
          getVendorInventory(id!)
        ]);
        setVendor(vRes.data);
        setInventory(iRes.data);
      } catch {
        toast.error('Failed to load vendor');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Loading vendor...</div>
    </div>
  );

  if (!vendor) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Vendor not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Vendor header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0B1F3A] text-[#F5A623] flex items-center justify-center font-bold text-lg shrink-0">
              {vendor.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#0B1F3A]">{vendor.full_name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVendorStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {vendor.vendor_type?.replace('_', ' ')} · Train {vendor.train_number} · Coach {vendor.coach_number}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">License: {vendor.license_number || 'N/A'} · FSSAI: {vendor.fssai_number || 'N/A'}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-green-700 font-bold text-lg justify-end">
                <Star size={16} fill="currentColor" /> {vendor.rating}
              </div>
              <p className="text-xs text-gray-400">{vendor.complaint_count} complaints</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-[#0B1F3A]">{vendor.rating}</p>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{vendor.complaint_count}</p>
              <p className="text-xs text-gray-400">Complaints</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#0B1F3A]">{inventory.length}</p>
              <p className="text-xs text-gray-400">Items listed</p>
            </div>
          </div>
        </div>

        {/* Price list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            <h2 className="font-semibold text-[#0B1F3A]">Price list</h2>
          </div>

          {inventory.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No inventory listed yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Item</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">IRCTC MRP</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Vendor price</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any) => (
                  <tr key={item.id} className="border-t border-gray-50">
                    <td className="px-6 py-3 text-gray-800">{item.price_list?.item_name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{formatCurrency(item.price_list?.irctc_mrp)}</td>
                    <td className={`px-4 py-3 text-center font-medium ${item.is_flagged ? 'text-red-600' : 'text-green-700'}`}>
                      {formatCurrency(item.listed_price)}
                      {item.is_flagged && ' ↑'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{item.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Actions */}
<div className="flex gap-3">
  <Link
    to={`/pay/${vendor.id}`}
    className="flex-1 bg-[#0B1F3A] text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
  >
    <CreditCard size={16} /> Pay this vendor
  </Link>
  <Link
    to={`/complaint?vendor=${vendor.id}&vendorName=${encodeURIComponent(vendor.full_name)}&train=${vendor.train_number}`}
    className="flex-1 bg-red-50 text-red-700 border border-red-200 py-3 rounded-xl font-semibold text-center hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
  >
    <AlertTriangle size={16} /> Report overcharge
  </Link>
  <Link
    to={`/complaint?vendor=${vendor.id}&vendorName=${encodeURIComponent(vendor.full_name)}&train=${vendor.train_number}&type=cash_demand`}
    className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 py-3 rounded-xl font-semibold text-center hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
  >
    <ShieldAlert size={16} /> Cash demanded
  </Link>
</div>
      </div>
    </div>
  );
};

export default VendorProfile;