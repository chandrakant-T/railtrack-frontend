import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { getVendorsByTrain } from '../../api/vendor.api';
import { getVendorInventory, updateVendorInventory, getPriceList } from '../../api/inventory.api';
import { getMyComplaints } from '../../api/complaint.api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { Package, QrCode, AlertTriangle, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedInventory, setEditedInventory] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plRes = await getPriceList();
        setPriceList(plRes.data);
        if (user) {
          const vRes = await getVendorsByTrain('');
          // In real app, fetch vendor by user_id
          // For now fetch price list and show inventory management
        }
      } catch {
        toast.error('Failed to load data');
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Vendor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory, QR code, and view complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Rating', value: '4.2', color: 'text-green-600' },
            { label: 'Transactions today', value: '127', color: 'text-[#0B1F3A]' },
            { label: 'Complaints', value: '3', color: 'text-red-600' }
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode size={18} className="text-gray-400" />
            <h2 className="font-semibold text-[#0B1F3A]">Your payment QR code</h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <svg width="80" height="80" viewBox="0 0 60 60" fill="none">
                <rect x="2" y="2" width="24" height="24" rx="2" stroke="#0B1F3A" strokeWidth="1.5"/>
                <rect x="8" y="8" width="12" height="12" rx="1" fill="#0B1F3A"/>
                <rect x="34" y="2" width="24" height="24" rx="2" stroke="#0B1F3A" strokeWidth="1.5"/>
                <rect x="40" y="8" width="12" height="12" rx="1" fill="#0B1F3A"/>
                <rect x="2" y="34" width="24" height="24" rx="2" stroke="#0B1F3A" strokeWidth="1.5"/>
                <rect x="8" y="40" width="12" height="12" rx="1" fill="#0B1F3A"/>
                <rect x="34" y="34" width="6" height="6" rx="1" fill="#0B1F3A"/>
                <rect x="44" y="34" width="6" height="6" rx="1" fill="#0B1F3A"/>
                <rect x="34" y="44" width="6" height="6" rx="1" fill="#0B1F3A"/>
                <rect x="44" y="52" width="6" height="6" rx="1" fill="#0B1F3A"/>
                <rect x="52" y="44" width="6" height="6" rx="1" fill="#0B1F3A"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#0B1F3A] mb-1">Scan to pay</p>
              <p className="text-gray-500 text-sm mb-3">Payment goes to Railway central account. Cash transactions are not allowed.</p>
              <div className="flex gap-2">
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium">QR Active</span>
                <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50">Download QR</button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <h2 className="font-semibold text-[#0B1F3A]">My inventory</h2>
            </div>
            <span className="text-xs text-gray-400">Prices flagged in red exceed IRCTC MRP</span>
          </div>

          {priceList.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Loading inventory...</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">Item</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">IRCTC MRP</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">My price (₹)</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.slice(0, 8).map((item: any) => {
                    const myPrice = editedInventory[item.id]?.price ?? item.irctc_mrp;
                    const myStock = editedInventory[item.id]?.stock ?? 0;
                    const isFlagged = parseFloat(myPrice) > parseFloat(item.irctc_mrp);
                    return (
                      <tr key={item.id} className="border-t border-gray-50">
                        <td className="px-6 py-3 text-gray-800">{item.item_name}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{formatCurrency(item.irctc_mrp)}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={myPrice}
                            onChange={(e) => setEditedInventory({
                              ...editedInventory,
                              [item.id]: { ...editedInventory[item.id], price: e.target.value }
                            })}
                            className={`w-20 border rounded px-2 py-1 text-center text-sm outline-none ${isFlagged ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-200 focus:border-[#0B1F3A]'}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={myStock}
                            onChange={(e) => setEditedInventory({
                              ...editedInventory,
                              [item.id]: { ...editedInventory[item.id], stock: e.target.value }
                            })}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-center text-sm outline-none focus:border-[#0B1F3A]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-100">
                <button
                  disabled={saving}
                  onClick={() => toast.success('Inventory saved!')}
                  className="bg-[#0B1F3A] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm hover:bg-blue-900 disabled:opacity-60"
                >
                  <Save size={15} /> {saving ? 'Saving...' : 'Save inventory'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recent complaints */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-gray-400" />
            <h2 className="font-semibold text-[#0B1F3A]">Complaints against me</h2>
          </div>
          <div className="py-12 text-center text-gray-400 text-sm">
            No complaints filed against you recently.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;