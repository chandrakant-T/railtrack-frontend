import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Train, AlertTriangle, Search, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    const map: Record<string, string> = {
      passenger: '/dashboard',
      vendor: '/vendor-dashboard',
      station_admin: '/station-admin',
      super_admin: '/super-admin'
    };
    return map[user.role] || '/';
  };

  return (
    <nav className="bg-[#0B1F3A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <Link to="/" className="flex items-center gap-2">
        <Train size={22} className="text-[#F5A623]" />
        <span className="text-lg font-semibold tracking-wide">RailTrack</span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <Link to="/search" className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors">
          <Search size={15} /> Train Search
        </Link>
        <Link to="/complaint" className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors">
          <AlertTriangle size={15} /> File Complaint
        </Link>
        <Link to="/transparency" className="flex items-center gap-1.5 hover:text-[#F5A623] transition-colors">
          Dashboard
        </Link>

        {user ? (
          <div className="flex items-center gap-4 ml-4">
            <Link to={getDashboardPath()} className="flex items-center gap-1.5 bg-[#F5A623] text-[#0B1F3A] px-3 py-1.5 rounded-lg font-medium hover:bg-amber-400 transition-colors">
              <LayoutDashboard size={15} /> My Dashboard
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
              <LogOut size={15} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 ml-4">
    <Link to="/login" className="hover:text-[#F5A623] transition-colors">Login</Link>
    <div className="relative group">
      <button className="bg-[#F5A623] text-[#0B1F3A] px-3 py-1.5 rounded-lg font-medium hover:bg-amber-400 transition-colors">
        Register ▾
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-1 w-44 hidden group-hover:block z-50">
        <Link to="/register" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          Passenger
        </Link>
        <Link to="/vendor-register" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
          Vendor
        </Link>
      </div>
    </div>
  </div>
        )}
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0B1F3A] border-t border-blue-900 px-6 py-4 flex flex-col gap-4 text-sm md:hidden">
          <Link to="/search" onClick={() => setMenuOpen(false)}>Train Search</Link>
          <Link to="/complaint" onClick={() => setMenuOpen(false)}>File Complaint</Link>
          <Link to="/transparency" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          {user ? (
            <>
              <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)}>My Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;