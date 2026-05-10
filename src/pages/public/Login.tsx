import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/auth.api';
import Navbar from '../../components/layout/Navbar';
import { Train, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const map: Record<string, string> = {
        passenger: '/dashboard',
        vendor: '/vendor-dashboard',
        station_admin: '/station-admin',
        super_admin: '/super-admin'
      };
      navigate(map[res.data.user.role] || '/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Train size={22} className="text-[#F5A623]" />
            <span className="text-[#0B1F3A] font-bold text-xl">RailTrack</span>
          </div>
          <h2 className="text-center text-gray-500 text-sm mb-8">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0B1F3A] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0B1F3A] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0B1F3A] font-semibold hover:underline">Register</Link>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 text-center mb-3">File a complaint without logging in</p>
            <Link
              to="/complaint"
              className="block text-center border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              File complaint as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;