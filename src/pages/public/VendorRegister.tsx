import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { registerVendor } from '../../api/auth.api';
import { Train, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    license_number: '',
    fssai_number: '',
    vendor_type: 'pantry_car',
    train_number: '',
    coach_number: '',
    zone: '',
    contact_phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.license_number) {
      return toast.error('Fill all required fields');
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await registerVendor(form);
      toast.success('Registration submitted successfully!');
      navigate('/vendor-register-success', {
        state: { vendor_code: res.data.vendor_code }
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0B1F3A] rounded-full flex items-center justify-center mx-auto mb-4">
            <Train size={24} className="text-[#F5A623]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">Vendor Registration</h1>
          <p className="text-gray-500 text-sm mt-2">Register as an IRCTC-licensed food vendor on RailTrack</p>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-700 font-medium text-sm">Approval required</p>
            <p className="text-blue-500 text-xs mt-0.5">Your registration will be reviewed by RailTrack admin before you can login. Make sure your IRCTC license number is correct.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          {/* Personal details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal Details</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Full name <span className="text-red-400">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="As per IRCTC license" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Email <span className="text-red-400">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* License details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">License Details</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">IRCTC License No. <span className="text-red-400">*</span></label>
                  <input name="license_number" value={form.license_number} onChange={handleChange} placeholder="IRCTC-XXXXX" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">FSSAI License No.</label>
                  <input name="fssai_number" value={form.fssai_number} onChange={handleChange} placeholder="FSSAI-XXXXX" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Vendor type <span className="text-red-400">*</span></label>
                <select name="vendor_type" value={form.vendor_type} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] bg-white">
                  <option value="pantry_car">Pantry Car</option>
                  <option value="tsv">Train Side Vendor (TSV)</option>
                  <option value="station_stall">Station Stall</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Train details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Train Assignment</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Train number</label>
                  <input name="train_number" value={form.train_number} onChange={handleChange} placeholder="e.g. 12951" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Coach number</label>
                  <input name="coach_number" value={form.coach_number} onChange={handleChange} placeholder="e.g. A1" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A]" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">Railway zone</label>
                <select name="zone" value={form.zone} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] bg-white">
                  <option value="">Select zone</option>
                  <option value="Western Railway">Western Railway</option>
                  <option value="Central Railway">Central Railway</option>
                  <option value="Northern Railway">Northern Railway</option>
                  <option value="Southern Railway">Southern Railway</option>
                  <option value="Eastern Railway">Eastern Railway</option>
                  <option value="South Central Railway">South Central Railway</option>
                  <option value="South Western Railway">South Western Railway</option>
                  <option value="North Western Railway">North Western Railway</option>
                  <option value="West Central Railway">West Central Railway</option>
                  <option value="North Central Railway">North Central Railway</option>
                  <option value="East Central Railway">East Central Railway</option>
                  <option value="East Coast Railway">East Coast Railway</option>
                  <option value="North Eastern Railway">North Eastern Railway</option>
                  <option value="Northeast Frontier Railway">Northeast Frontier Railway</option>
                  <option value="South East Central Railway">South East Central Railway</option>
                  <option value="Metro Railway">Metro Railway</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#0B1F3A] text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Submitting...' : 'Submit vendor registration →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0B1F3A] font-semibold hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Registering as a passenger?{' '}
          <Link to="/register" className="text-[#0B1F3A] font-semibold hover:underline">Passenger registration</Link>
        </p>
      </div>
    </div>
  );
};

export default VendorRegister;