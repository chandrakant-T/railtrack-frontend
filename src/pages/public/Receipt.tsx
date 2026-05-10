import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { formatCurrency } from '../../utils/helpers';
import { CheckCircle, Download, AlertTriangle } from 'lucide-react';

const Receipt = () => {
  const { state } = useLocation();

  if (!state) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Receipt not found</div>
    </div>
  );

  const { receipt_id, vendor_name, items, total, payment_id } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10">

        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Payment successful</h1>
          <p className="text-gray-500 text-sm mt-1">Your receipt has been generated</p>
        </div>

        {/* Receipt card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-xs text-gray-400 mb-1">Receipt ID</p>
            <p className="font-bold text-lg text-[#0B1F3A] tracking-wider">{receipt_id}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm mb-6">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-400">Vendor</span>
              <span className="font-medium">{vendor_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-400">Payment ID</span>
              <span className="font-medium text-xs">{payment_id?.slice(-12)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.qty}</span>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between font-bold">
            <span>Total paid</span>
            <span className="text-green-700 text-lg">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Overcharge notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-700 text-sm">
            If the amount charged differs from this receipt, file an overcharging complaint immediately.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/complaint" className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold text-center hover:bg-gray-50">
            <AlertTriangle size={14} className="inline mr-1" />
            Report issue
          </Link>
          <Link to="/" className="flex-1 bg-[#0B1F3A] text-white py-3 rounded-xl text-sm font-semibold text-center hover:bg-blue-900">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Receipt;