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

    let formattedPaymentId = paymentId.trim();
    if (formattedPaymentId && !formattedPaymentId.startsWith('pay_')) {
      formattedPaymentId = `pay_${formattedPaymentId}`;
    }

    // Attempt AI refund ONLY if a Payment ID is explicitly provided
    const hasPaymentId = Boolean(formattedPaymentId);
    const shouldAttemptRefund = hasPaymentId && type === 'overcharging';

    setLoading(true);
    if (shouldAttemptRefund) {
      setIsRefunding(true);
    }
    setRefundStatus(null);

    let refundData: any = null;

    try {
      // 1. Process Autonomous AI Refund if payment ID is attached
      if (shouldAttemptRefund) {
        try {
          const disputeRes = await api.post('/dispute/auto-refund', {
            paymentId: formattedPaymentId,
            chargedAmount: parseFloat(form.charged_price) || 0,
            officialMrp: parseFloat(form.irctc_price) || 0,
            itemName: form.item_name || 'Food Item'
          });

          if (disputeRes.data?.refunded) {
            refundData = disputeRes.data;
            setRefundStatus(disputeRes.data);
            toast.success(`Instant AI Refund Processed! ₹${disputeRes.data.amountRefunded} credited.`);
          } else {
            toast.error(disputeRes.data?.reason || 'Payment verification failed: No refund issued.');
          }
        } catch (disputeErr: any) {
          console.error('Auto-refund error:', disputeErr);
          const errorMsg = disputeErr.response?.data?.reason || disputeErr.response?.data?.error || 'Payment ID not verified on Razorpay Gateway.';
          toast.error(errorMsg);
        } finally {
          setIsRefunding(false); // Always stop refunding spinner
        }
      }

      // 2. Submit Complaint to DB with actual refund execution state
      const payload: any = {
        passenger_id: user?.id || null,
        complaint_type: type,
        train_number: form.train_number,
        coach_number: form.coach_number,
        vendor_name: form.vendor_name,
        description: form.description,
        passenger_phone: form.passenger_phone,
        payment_id: formattedPaymentId || null,
        refund_status: refundData?.refunded ? 'refunded' : 'none',
        refund_amount: refundData?.amountRefunded || 0,
        refund_id: refundData?.refundId || null
      };

      if (form.vendor_id) payload.vendor_id = form.vendor_id;
      if (form.item_name) payload.item_name = form.item_name;
      if (form.irctc_price) payload.irctc_price = parseFloat(form.irctc_price);
      if (form.charged_price) payload.charged_price = parseFloat(form.charged_price);

      const res = await fileComplaint(payload);
      toast.success('Complaint filed successfully!');

      setTimeout(() => {
        navigate(user ? '/dashboard' : `/track?ref=${res.data.reference_id}`);
      }, refundData?.refunded ? 2500 : 1000);

    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.error || 'Failed to file complaint');
    } finally {
      // Guaranteed state cleanup prevents stuck button
      setLoading(false);
      setIsRefunding(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return toast.error('Browser does not support voice recognition. Use Chrome/Edge.');
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak your complaint now');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setAiLoading(true);

      try {
        const res = await api.post('/ai/parse-voice', { transcript });
        if (res.data.success) {
          const aiData = res.data.data;
          setForm((prev) => ({
            ...prev,
            train_number: aiData.train_number || prev.train_number,
            coach_number: aiData.coach_number || prev.coach_number,
            vendor_name: aiData.vendor_name || prev.vendor_name,
            item_name: aiData.item_name || prev.item_name,
            charged_price: aiData.charged_price ? String(aiData.charged_price) : prev.charged_price,
            description: aiData.summary || transcript
          }));
          if (aiData.complaint_type) setType(aiData.complaint_type);
          toast.success('Form auto-filled by AI!');
        }
      } catch {
        toast.error('AI could not parse audio. Please enter details manually.');
      } finally {
        setAiLoading(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice input failed');
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">File a complaint</h1>
        <p className="text-gray-500 text-sm mb-8">Auto-routed to the nearest upcoming station using live position.</p>

        {/* Complaint Type Selector */}
        <div className="flex gap-3 mb-8">
          <button
            type="button"
            onClick={() => setType('overcharging')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-colors ${type === 'overcharging' ? 'bg-[#0B1F3A] text-[#F5A623] border-[#0B1F3A]' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            <AlertTriangle size={16} /> Overcharging
          </button>
          <button
            type="button"
            onClick={() => setType('cash_demand')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-colors ${type === 'cash_demand' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            <ShieldAlert size={16} /> Cash demanded
          </button>
        </div>

        {/* Vernacular Voice Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-[#0B1F3A] text-sm">Speak your complaint (Hindi/English)</p>
            <p className="text-xs text-gray-500">Tap microphone to auto-fill details using AI voice input.</p>
          </div>
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isListening || aiLoading}
            className={`p-3 rounded-full text-white font-medium flex items-center gap-2 transition-all ${
              isListening ? 'bg-red-600 animate-pulse' : 'bg-[#0B1F3A] hover:bg-blue-900'
            }`}
          >
            {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Mic size={18} />}
          </button>
        </div>

        {/* AI Refund Issued Banner */}
        {refundStatus && refundStatus.refunded && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-emerald-800 text-sm shadow-sm">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-base">
              <Zap size={18} className="text-emerald-600 fill-emerald-600" />
              Autonomous AI Refund Issued!
            </div>
            <p>Amount Refunded: <strong className="text-emerald-950 font-bold">₹{refundStatus.amountRefunded}</strong></p>
            <p className="text-xs text-emerald-700 mt-1">
              Refund ID: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{refundStatus.refundId}</code>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Train number <span className="text-red-400">*</span></label>
              <input name="train_number" value={form.train_number} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Coach number</label>
              <input name="coach_number" value={form.coach_number} onChange={handleChange} placeholder="e.g. B2" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Vendor name</label>
            <input name="vendor_name" value={form.vendor_name} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
          </div>

          {type === 'overcharging' && (
            <>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Item name</label>
                <input name="item_name" value={form.item_name} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">IRCTC price (₹)</label>
                  <input name="irctc_price" type="number" value={form.irctc_price} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Price charged (₹)</label>
                  <input name="charged_price" type="number" value={form.charged_price} onChange={handleChange} className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">
                  Razorpay Payment ID <span className="text-gray-400 font-normal">(Optional for Instant AI Refund)</span>
                </label>
                <input
                  name="paymentId"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  placeholder="e.g. pay_P1a2B3c4D5e6F7"
                  className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none font-mono focus:border-[#0B1F3A]"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] resize-none" />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Your phone number <span className="text-red-400">*</span></label>
            <input name="passenger_phone" value={form.passenger_phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
          </div>

          <button
            type="submit"
            disabled={loading || isRefunding}
            className="bg-[#0B1F3A] text-white py-3.5 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isRefunding ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Analyzing & Processing Refund...
              </>
            ) : loading ? (
              'Submitting Complaint...'
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