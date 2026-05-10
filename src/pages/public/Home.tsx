import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Search, AlertTriangle, ShieldCheck, TrendingUp, Train, CreditCard } from 'lucide-react';

const Home = () => {
  const [trainNumber, setTrainNumber] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trainNumber.trim()) navigate(`/search?train=${trainNumber.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0B1F3A] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900 text-[#F5A623] px-4 py-1.5 rounded-full text-sm mb-6">
            <Train size={14} /> India's Railway Food Accountability Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Know the price.<br />Pay the right way.<br />
            <span className="text-[#F5A623]">Report instantly.</span>
          </h1>
          <p className="text-blue-300 text-lg mb-10 max-w-xl mx-auto">
            Every vendor tracked. Every rupee traced. Every complaint reaches the right authority in under 60 seconds.
          </p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto">
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter train number (e.g. 12951)"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm outline-none"
            />
            <button type="submit" className="bg-[#F5A623] text-[#0B1F3A] px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors flex items-center gap-2">
              <Search size={16} /> Search
            </button>
          </form>
          <p className="text-blue-400 text-xs mt-3">No login needed to search prices or file a complaint</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '2,847', label: 'Registered Vendors' },
            { value: '14,392', label: 'Complaints Filed' },
            { value: '68%', label: 'Resolution Rate' }
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-[#0B1F3A]">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0B1F3A] text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Search size={20} className="text-blue-700" />, bg: 'bg-blue-50', title: 'Search your train', desc: 'Enter your train number to see all active vendors, their items, and official IRCTC prices.' },
              { icon: <CreditCard size={20} className="text-green-700" />, bg: 'bg-green-50', title: 'Pay by QR', desc: 'Scan the vendor QR code and pay via UPI. Money goes to Railway\'s central account — every rupee traced.' },
              { icon: <AlertTriangle size={20} className="text-red-700" />, bg: 'bg-red-50', title: 'Report instantly', desc: 'Overcharged or asked for cash? File a complaint in seconds. It auto-routes to the nearest station.' }
            ].map((step) => (
              <div key={step.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className={`${step.bg} w-10 h-10 rounded-full flex items-center justify-center mb-4`}>
                  {step.icon}
                </div>
                <h3 className="font-semibold text-[#0B1F3A] mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#0B1F3A] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">What makes RailTrack different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <ShieldCheck size={18} />, title: 'Real-time complaint routing', desc: 'Complaints reach the nearest station automatically using live train position data.' },
              { icon: <TrendingUp size={18} />, title: 'Public transparency', desc: 'Anyone can view complaint heatmaps, top offenders, and resolution rates — no login needed.' },
              { icon: <CreditCard size={18} />, title: 'Cashless payments', desc: 'Every transaction is logged. Cash demand is a priority complaint with instant GRP alert.' },
              { icon: <Train size={18} />, title: 'Full vendor registry', desc: 'Every licensed vendor tracked by train, coach, zone — with inventory and price history.' }
            ].map((f) => (
              <div key={f.title} className="flex gap-4 bg-blue-900 rounded-xl p-5">
                <div className="text-[#F5A623] mt-0.5 shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-blue-300 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-[#0B1F3A] mb-4">Travelled on a train recently?</h2>
        <p className="text-gray-500 mb-8">Check if your vendor was overcharging or file a complaint right now.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/search" className="bg-[#0B1F3A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
            Search vendors
          </Link>
          <Link to="/complaint" className="bg-red-50 text-red-700 border border-red-200 px-6 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors">
            File a complaint
          </Link>
          <Link to="/track" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Track my complaint
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1F3A] text-blue-400 text-center py-6 text-sm">
        RailTrack © {new Date().getFullYear()} — Built for India's 13 million daily railway passengers
      </footer>
    </div>
  );
};

export default Home;