import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { getVendorById } from '../../api/vendor.api';
import { getVendorInventory } from '../../api/inventory.api';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/helpers';
import { ShieldAlert, Plus, Minus, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

declare global {
  interface Window { Razorpay: any; }
}

const PayVendor = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vendor, setVendor] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // Dynamically load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const fetchData = async () => {
      try {
        const [vRes, iRes] = await Promise.all([
          getVendorById(vendorId!),
          getVendorInventory(vendorId!)
        ]);
        setVendor(vRes.data);
        setInventory(iRes.data || []);
      } catch {
        toast.error('Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) fetchData();
  }, [vendorId]);

  const updateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [itemId]: updated };
    });
  };

  const cartItems = inventory.filter(item => cart[item.id] > 0);
  const total = cartItems.reduce((sum, item) => sum + (cart[item.id] * item.listed_price), 0);

  const handlePayment = async () => {
    if (cartItems.length === 0) return toast.error('Add at least one item to cart');
    setPaying(true);

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', {
        amount: total,
        vendor_id: vendorId,
        items: cartItems.map(item => ({
          name: item.price_list?.item_name || 'Food Item',
          qty: cart[item.id],
          price: item.listed_price,
          irctc_mrp: item.price_list?.irctc_mrp || item.listed_price
        })),
        train_number: vendor?.train_number,
        coach_number: vendor?.coach_number
      });

      const { order_id, amount, currency, key_id, payment_id } = orderRes.data;

      // 2. Configure Razorpay modal
      const options = {
        key: key_id,
        amount,
        currency,
        name: 'RailTrack',
        description: `Payment to ${vendor?.full_name}`,
        order_id,
        config: {
          display: {
            blocks: {
              utib: {
                name: 'Pay via UPI',
                instruments: [{ method: 'upi' }]
              }
            },
            sequence: ['block.utib'],
            preferences: { show_default_blocks: true }
          }
        },
        handler: async (response: any) => {
          try {
            const cleanPaymentId = response.razorpay_payment_id.startsWith('pay_')
              ? response.razorpay_payment_id
              : `pay_${response.razorpay_payment_id}`;

            const itemSummary = cartItems.map(i => `${i.price_list?.item_name || 'Food Item'} (x${cart[i.id]})`).join(', ');

            // 3. Verify payment on backend & save to DB via single secure API call
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: cleanPaymentId,
              razorpay_signature: response.razorpay_signature,
              payment_db_id: payment_id,
              user_id: user?.id || null,
              vendor_id: vendorId,
              vendor_name: vendor?.full_name,
              amount: total,
              item_name: itemSummary
            });

            toast.success('Payment successful!');

            // 4. Navigate to receipt page
            navigate(`/receipt/${verifyRes.data.receipt_id || 'RCPT-' + Date.now()}`, {
              state: {
                receipt_id: verifyRes.data.receipt_id || `RCPT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                vendor_name: vendor?.full_name,
                train_number: vendor?.train_number,
                items: cartItems.map(item => ({
                  name: item.price_list?.item_name || 'Food Item',
                  qty: cart[item.id],
                  price: item.listed_price,
                  irctc_mrp: item.price_list?.irctc_mrp || item.listed_price
                })),
                total,
                payment_id: cleanPaymentId
              }
            });
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error('Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        prefill: { name: user?.name || 'RailTrack Passenger' },
        theme: { color: '#0B1F3A' },
        modal: { ondismiss: () => setPaying(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Order creation error:', err);
      toast.error('Failed to initiate payment');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-32 text-gray-400">Loading vendor inventory...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Vendor info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0B1F3A] text-[#F5A623] flex items-center justify-center font-bold text-base">
            {vendor?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'VN'}
          </div>
          <div>
            <p className="font-semibold text-[#0B1F3A]">{vendor?.full_name}</p>
            <p className="text-gray-500 text-sm">
              Train {vendor?.train_number} · Coach {vendor?.coach_number || 'All'} · {vendor?.vendor_code}
            </p>
          </div>
        </div>

        {/* Cash warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 text-sm">Cash payments strictly prohibited</p>
            <p className="text-red-500 text-xs mt-0.5">If this vendor demands cash, report it immediately to alert Station Master & GRP.</p>
            <button
              onClick={() => navigate(`/complaint?vendor=${vendorId}&vendorName=${encodeURIComponent(vendor?.full_name)}&train=${vendor?.train_number}&type=cash_demand`)}
              className="mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Report cash demand →
            </button>
          </div>
        </div>

        {/* Item selector */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#0B1F3A]">Select items</h2>
          </div>
          {inventory.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No items currently available from this vendor</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {inventory.map((item: any) => {
                const isOvercharged = parseFloat(item.listed_price) > parseFloat(item.price_list?.irctc_mrp || item.listed_price);

                return (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{item.price_list?.item_name}</p>
                      <p className={`text-sm font-semibold ${isOvercharged ? 'text-red-600' : 'text-green-700'}`}>
                        {formatCurrency(item.listed_price)}
                        {isOvercharged && (
                          <span className="text-xs ml-1.5 text-red-500 font-normal">
                            (Official MRP: {formatCurrency(item.price_list?.irctc_mrp)})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCart(item.id, -1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{cart[item.id] || 0}</span>
                      <button
                        onClick={() => updateCart(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-[#0B1F3A] flex items-center justify-center hover:bg-blue-900 text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart summary */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-[#0B1F3A] mb-4">Order summary</h2>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <span className="text-gray-600">{item.price_list?.item_name} × {cart[item.id]}</span>
                <span className="font-medium">{formatCurrency(cart[item.id] * item.listed_price)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-[#0B1F3A] text-base">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={paying || cartItems.length === 0}
          className="w-full bg-[#0B1F3A] text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-900 disabled:opacity-50 transition-colors shadow-sm"
        >
          <CreditCard size={18} />
          {paying ? 'Processing Payment...' : `Pay ${cartItems.length > 0 ? formatCurrency(total) : ''} via UPI`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Powered by Razorpay · Secured by Indian Railways · Autonomous AI Overcharge Monitoring Active
        </p>
      </div>
    </div>
  );
};

export default PayVendor;