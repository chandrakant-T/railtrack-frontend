import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { fileComplaint } from '../../api/complaint.api';
import { AlertTriangle, ShieldAlert, Mic, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const FileComplaint = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [type, setType] = useState(searchParams.get('type') || 'overcharging');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const rawPaymentId = searchParams.get('paymentId') || searchParams.get('payId') || '';
  const initialPaymentId = rawPaymentId ? (rawPaymentId.startsWith('pay_') ? rawPaymentId : `pay_${rawPaymentId}`) : '';

  const [paymentId, setPaymentId] = useState(initialPaymentId);
  const [refundStatus, setRefundStatus] = useState<any>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  const [form, setForm] = useState({
    train_number: searchParams.get('train') || '12951',
    coach_number: searchParams.get('coach') || '',
    vendor_name: searchParams.get('vendorName') || '',
    vendor_id: searchParams.get('vendor') || '',
    item_name: searchParams.get('item') || '',
    irctc_price: searchParams.get('mrp') || '',
    charged_price: searchParams.get('amount') || '',
    description: '',
    passenger_phone: ''
  });

  useEffect(() => {
    if (rawPaymentId) {
      setPaymentId(rawPaymentId.startsWith('pay_') ? rawPaymentId : `pay_${rawPaymentId}`);
    }
  }, [rawPaymentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.train_number) return toast.error('Train number is required');
    if (!form.passenger_phone) return toast.error('Phone number is required');

    setLoading(true);
    setIsRefunding(true);

    let formattedPaymentId = paymentId.trim();
    if (formattedPaymentId && !formattedPaymentId.startsWith('pay_')) {
      formattedPaymentId = `pay_${formattedPaymentId}`;
    }

    try {
      // 1. Process Autonomous AI Refund
      if (formattedPaymentId && type === 'overcharging') {
        try {
          const disputeRes = await api.post('/dispute/auto-refund', {
            paymentId: formattedPaymentId,
            chargedAmount: parseFloat(form.charged_price) || 0,
            officialMrp: parseFloat(form.irctc_price) || parseFloat(form.charged_price) || 0,
            itemName: form.item_name || 'Food Item'
          });

          if (disputeRes.data?.refunded) {
            setRefundStatus(disputeRes.data);
            toast.success(`Instant AI Refund Processed! ₹${disputeRes.data.amountRefunded} credited.`);
          } else {
            toast(disputeRes.data?.reason || 'Dispute checked.');
          }
        } catch (disputeErr) {
          console.error('Auto-refund error:', disputeErr);
        }
      }

      // 2. Submit Complaint to DB with passenger_id & payment_id
      const payload: any = {
        passenger_id: user?.id || null,
        complaint_type: type,
        train_number: form.train_number,
        coach_number: form.coach_number,
        vendor_name: form.vendor_name,
        description: form.description,
        passenger_phone: form.passenger_phone,
        payment_id: formattedPaymentId || null
      };

      if (form.vendor_id) payload.vendor_id = form.vendor_id;
      if (form.item_name) payload.item_name = form.item_name;
      if (form.irctc_price) payload.irctc_price = parseFloat(form.irctc_price);
      if (form.charged_price) payload.charged_price = parseFloat(form.charged_price);

      const res = await fileComplaint(payload);
      toast.success('Complaint filed successfully!');

      // RESET LOADING STATES IMMEDIATELY TO UNSTICK BUTTON
      setLoading(false);
      setIsRefunding(false);

      // Redirect to Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.error || 'Failed to file complaint');
      setLoading(false);
      setIsRefunding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">File a complaint</h1>

        {/* AI Refund Banner */}
        {refundStatus && refundStatus.refunded && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-emerald-800 text-sm shadow-sm">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-base">
              <Zap size={18} className="text-emerald-600 fill-emerald-600" />
              Autonomous AI Refund Issued!
            </div>
            <p>Amount Refunded: <strong className="text-emerald-950 font-bold">₹{refundStatus.amountRefunded}</strong></p>
            <p className="text-xs text-emerald-700">
              Refund ID: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{refundStatus.refundId}</code>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Train number *</label>
              <input name="train_number" value={form.train_number} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Coach number</label>
              <input name="coach_number" value={form.coach_number} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Vendor name</label>
            <input name="vendor_name" value={form.vendor_name} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Item name</label>
            <input name="item_name" value={form.item_name} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">IRCTC price (₹)</label>
              <input name="irctc_price" type="number" value={form.irctc_price} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Price charged (₹)</label>
              <input name="charged_price" type="number" value={form.charged_price} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Razorpay Payment ID</label>
            <input name="paymentId" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-sm outline-none font-mono" />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Your phone number *</label>
            <input name="passenger_phone" value={form.passenger_phone} onChange={handleChange} className="w-full border rounded-lg px-4 py-2 text-sm outline-none" />
          </div>

          <button
            type="submit"
            disabled={loading || isRefunding}
            className="bg-[#0B1F3A] text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isRefunding ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Analyzing & Processing Refund...
              </>
            ) : loading ? (
              'Submitting...'
            ) : (
              'Submit complaint →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileComplaint;