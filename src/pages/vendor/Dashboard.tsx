import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { getAllVendors } from '../../api/vendor.api';
import { getVendorInventory, updateVendorInventory, getPriceList } from '../../api/inventory.api';
import { formatCurrency, getStatusColor, formatDate } from '../../utils/helpers';
import { Package, QrCode, AlertTriangle, Save } from 'lucide-react';
import api from '../../api/axios';
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
      // Step 1 — find vendor profile linked to this user
      const allVendors = await api.get('/vendors');
      const myVendor = allVendors.data?.find((v: any) => v.user_id === user?.id);

      if (!myVendor) {
        toast.error('Vendor profile not found. Contact admin.');
        setLoading(false);
        return;
      }

      setVendor(myVendor);

      // Step 2 — fetch price list and inventory separately (not in Promise.all with complaints)
      const [plRes, invRes] = await Promise.all([
        getPriceList(),
        getVendorInventory(myVendor.id)
      ]);

      setPriceList(plRes.data);

      // Step 3 — pre-fill editedInventory from existing inventory
      const invMap: Record<string, any> = {};
      invRes.data.forEach((item: any) => {
        invMap[item.price_list_id] = {
          price: item.listed_price,
          stock: item.stock_quantity
        };
      });
      setEditedInventory(invMap);
      setInventory(invRes.data);

      // Step 4 — fetch complaints separately so failure doesn't crash everything
      try {
        const cRes = await api.get(`/complaints/vendor/${myVendor.id}`);
        setComplaints(cRes.data || []);
      } catch {
        setComplaints([]); // complaints failing is non-critical
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (user) fetchData();
}, [user]);

  const handleSaveInventory = async () => {
    if (!vendor) return;
    setSaving(true);
    try {
      const items = priceList.map((item: any) => ({
        price_list_id: item.id,
        listed_price: parseFloat(editedInventory[item.id]?.price ?? item.irctc_mrp),
        stock_quantity: parseInt(editedInventory[item.id]?.stock ?? 0)
      })).filter(item => item.stock_quantity > 0); // only save items with stock > 0

      await updateVendorInventory(vendor.id, items);
      toast.success('Inventory saved successfully!');

      // Refresh inventory
      const invRes = await getVendorInventory(vendor.id);
      setInventory(invRes.data);
    } catch {
      toast.error('Failed to save inventory');
    } finally {
      setSaving(false);
    }
  };

  const paymentUrl = vendor
    ? `${window.location.origin}/pay/${vendor.id}`
    : '';

  const qrUrl = vendor
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(paymentUrl)}&color=0B1F3A&bgcolor=FFFFFF`
    : '';

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Loading dashboard...</div>
    </div>
  );

  if (!vendor) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Vendor profile not found. Contact admin.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#0B1F3A] text-[#F5A623] flex items-center justify-center font-bold text-lg">
            {vendor.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3A]">{vendor.full_name}</h1>
            <p className="text-gray-500 text-sm">
              {vendor.vendor_code} · Train {vendor.train_number} · Coach {vendor.coach_number}
            </p>
          </div>
          <span className="ml-auto bg-green-100 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium">
            {vendor.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Rating', value: vendor.rating, color: 'text-green-600' },
            { label: 'Items in stock', value: inventory.length, color: 'text-[#0B1F3A]' },
            { label: 'Complaints', value: vendor.complaint_count, color: 'text-red-600' }
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
          <div className="flex items-center gap-8 flex-wrap">
            <div className="shrink-0 text-center">
              <img
                src={qrUrl}
                alt="Vendor QR Code"
                className="rounded-xl border border-gray-100 w-36 h-36"
              />
              <p className="text-xs text-gray-400 mt-2">Scan to pay</p>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#0B1F3A] mb-1">Show this to passengers</p>
              <p className="text-gray-500 text-sm mb-1">Passengers scan this QR → select items → pay via UPI.</p>
              <p className="text-gray-400 text-xs mb-4 break-all">{paymentUrl}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium">QR Active</span>
                <a
                  href={qrUrl}
                  download="railtrack-qr.png"
                  target="_blank"
                  className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Download QR
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentUrl);
                    toast.success('Payment link copied!');
                  }}
                  className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Manager */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <h2 className="font-semibold text-[#0B1F3A]">Manage inventory</h2>
            </div>
            <p className="text-xs text-gray-400">Set stock to 0 to hide an item · Red = above IRCTC MRP</p>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Item</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">IRCTC MRP</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">My price (₹)</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Stock qty</th>
              </tr>
            </thead>
            <tbody>
              {priceList.map((item: any) => {
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
                        min="0"
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

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Changes are saved to the database and visible to passengers immediately</p>
            <button
              disabled={saving}
              onClick={handleSaveInventory}
              className="bg-[#0B1F3A] text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm hover:bg-blue-900 disabled:opacity-60"
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save inventory'}
            </button>
          </div>
        </div>

        {/* Recent complaints */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-gray-400" />
            <h2 className="font-semibold text-[#0B1F3A]">Complaints against me</h2>
          </div>
          {complaints.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No complaints filed against you.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {complaints.map((c: any) => (
                <div key={c.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{c.reference_id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{c.complaint_type?.replace('_', ' ')} · {formatDate(c.filed_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;