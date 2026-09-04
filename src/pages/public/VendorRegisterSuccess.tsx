import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { CheckCircle, Clock } from 'lucide-react';

const VendorRegisterSuccess = () => {
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B1F3A] mb-2">Registration submitted!</h1>
        <p className="text-gray-500 mb-8">Your vendor registration is under review. You will be able to login once approved by RailTrack admin.</p>

        {state?.vendor_code && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
            <p className="text-gray-400 text-sm mb-1">Your Vendor Code</p>
            <p className="text-2xl font-bold text-[#0B1F3A] tracking-widest">{state.vendor_code}</p>
            <p className="text-gray-400 text-xs mt-2">Save this code for your records</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
          <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-700 font-medium text-sm">What happens next?</p>
            <ul className="text-amber-600 text-xs mt-1 flex flex-col gap-1">
              <li>→ Admin reviews your IRCTC license</li>
              <li>→ Account gets approved within 24-48 hours</li>
              <li>→ You can then login and access vendor dashboard</li>
              <li>→ Set up your inventory and get your QR code</li>
            </ul>
          </div>
        </div>

        <Link to="/login" className="block bg-[#0B1F3A] text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors">
          Go to login
        </Link>
      </div>
    </div>
  );
};

export default VendorRegisterSuccess;