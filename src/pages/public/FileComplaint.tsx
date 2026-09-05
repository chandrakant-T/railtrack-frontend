import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../api/axios';
import { fileComplaint } from '../../api/complaint.api';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Mic, Loader2 } from 'lucide-react';

const FileComplaint = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [type, setType] = useState(searchParams.get('type') || 'overcharging');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    train_number: searchParams.get('train') || '',
    coach_number: '',
    vendor_name: searchParams.get('vendorName') || '',
    vendor_id: searchParams.get('vendor') || '',
    item_name: '',
    irctc_price: '',
    charged_price: '',
    description: '',
    passenger_phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.train_number) return toast.error('Train number is required');
    if (!form.passenger_phone) return toast.error('Phone number is required for tracking');
    setLoading(true);
    try {
      const payload: any = {
        complaint_type: type,
        train_number: form.train_number,
        coach_number: form.coach_number,
        vendor_name: form.vendor_name,
        description: form.description,
        passenger_phone: form.passenger_phone
      };
      if (form.vendor_id) payload.vendor_id = form.vendor_id;
      if (form.item_name) payload.item_name = form.item_name;
      if (form.irctc_price) payload.irctc_price = parseFloat(form.irctc_price);
      if (form.charged_price) payload.charged_price = parseFloat(form.charged_price);

      const res = await fileComplaint(payload);
      toast.success('Complaint filed successfully!');
      navigate(`/track?ref=${res.data.reference_id}`);
    } catch {
      toast.error('Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return toast.error('Browser does not support voice recognition. Use Chrome/Edge.');
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Supports Hindi + English mix (Hinglish)
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
    toast.success('Listening... Speak your complaint now');
  };

  recognition.onresult = async (event: any) => {
    const transcript = event.results[0][0].transcript;
    setIsListening(false);
    setAiLoading(true);
    toast.loading('AI is analyzing your spoken complaint...');

    try {
      const res = await api.post('/ai/parse-voice', { transcript });
      toast.dismiss();

      if (res.data.success) {
        const aiData = res.data.data;
        
        // Auto-fill the existing form state with AI extracted values!
        setForm((prev) => ({
          ...prev,
          train_number: aiData.train_number || prev.train_number,
          coach_number: aiData.coach_number || prev.coach_number,
          vendor_name: aiData.vendor_name || prev.vendor_name,
          item_name: aiData.item_name || prev.item_name,
          charged_price: aiData.charged_price ? String(aiData.charged_price) : prev.charged_price,
          description: aiData.summary || transcript
        }));

        if (aiData.complaint_type) {
          setType(aiData.complaint_type);
        }

        toast.success('Form auto-filled by AI!');
      }
    } catch {
      toast.dismiss();
      toast.error('AI could not parse audio. Please enter details manually.');
    } finally {
      setAiLoading(false);
    }
  };

  recognition.onerror = () => {
    setIsListening(false);
    toast.dismiss();
    toast.error('Voice input cancelled or failed');
  };

  recognition.start();
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">File a complaint</h1>
        <p className="text-gray-500 text-sm mb-8">No login needed. Your complaint will be auto-routed to the nearest station.</p>

        {/* Type selector */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setType('overcharging')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-colors ${type === 'overcharging' ? 'bg-[#0B1F3A] text-[#F5A623] border-[#0B1F3A]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
          >
            <AlertTriangle size={16} /> Overcharging
          </button>
          <button
            onClick={() => setType('cash_demand')}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-colors ${type === 'cash_demand' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
          >
            <ShieldAlert size={16} /> Cash demanded
          </button>
        </div>

        {type === 'cash_demand' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700 flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p>Priority complaint — will be forwarded to Station Master + GRP immediately.</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
  <div>
    <p className="font-semibold text-[#0B1F3A] text-sm">Speak your complaint (Hindi/English)</p>
    <p className="text-xs text-gray-500">Click microphone and speak e.g. "Bhaiya ne Rail Neer ke 20 rupey liye coach B3 mein train 12951 mein"</p>
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



        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Train number <span className="text-red-400">*</span></label>
              <input name="train_number" value={form.train_number} onChange={handleChange} placeholder="e.g. 12951" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Coach number</label>
              <input name="coach_number" value={form.coach_number} onChange={handleChange} placeholder="e.g. B2" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Vendor name</label>
            <input name="vendor_name" value={form.vendor_name} onChange={handleChange} placeholder="Name of the vendor" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
          </div>

          {type === 'overcharging' && (
            <>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Item name</label>
                <input name="item_name" value={form.item_name} onChange={handleChange} placeholder="e.g. Rail Neer water" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">IRCTC price (₹)</label>
                  <input name="irctc_price" type="number" value={form.irctc_price} onChange={handleChange} placeholder="14" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Price charged (₹)</label>
                  <input name="charged_price" type="number" value={form.charged_price} onChange={handleChange} placeholder="20" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe what happened..." rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] resize-none" />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Your phone number <span className="text-red-400">*</span></label>
            <input name="passenger_phone" value={form.passenger_phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
            <p className="text-xs text-gray-400 mt-1">Used to send your complaint reference ID</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
            Your complaint will be auto-routed to the nearest upcoming station using live train position.
          </div>

          <button type="submit" disabled={loading} className="bg-[#0B1F3A] text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit complaint →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileComplaint;