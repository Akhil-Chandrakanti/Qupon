import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function getDaysLeft(expiryDate) {
  const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function CouponDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/coupons/${id}`).then(res => setCoupon(res.data)).catch(() => navigate('/marketplace')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBuy = async e => {
    e.preventDefault();
    if (!upiId.trim()) return setError('Please enter your UPI ID');
    setBuyLoading(true);
    setError('');
    try {
      const res = await api.post(`/coupons/${id}/buy`, { upiId });
      setSuccess(res.data);
      setCoupon(prev => ({ ...prev, status: 'sold', code: res.data.code, buyerId: user.id }));
      setShowBuyModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBuyLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-2xl mb-6"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    </div>
  );

  if (!coupon) return null;

  const daysLeft = getDaysLeft(coupon.expiryDate);
  const savings = coupon.originalValue - coupon.sellingPrice;
  const savingPct = Math.round((savings / coupon.originalValue) * 100);
  const isOwner = user && (coupon.sellerId === user.id || coupon.buyerId === user.id);
  const isPurchased = user && coupon.buyerId === user.id;
  const isSold = coupon.status === 'sold';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors">
        ← Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Main */}
        <div className="md:col-span-3 space-y-6">
          {/* Banner */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">{coupon.brand}</span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">{coupon.category}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black mb-3 leading-snug">{coupon.title}</h1>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-3xl font-black">₹{coupon.sellingPrice}</span>
                    <span className="ml-2 text-white/60 line-through">₹{coupon.originalValue}</span>
                  </div>
                  <div className="bg-white text-brand-600 font-bold px-3 py-1 rounded-full text-sm">
                    Save {savingPct}%
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-4 text-sm mb-6">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span>📅</span>
                  <div>
                    <p className="text-xs text-gray-400">Expires</p>
                    <p className="font-semibold text-gray-700">{new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${daysLeft <= 7 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <span>⏳</span>
                  <div>
                    <p className="text-xs text-gray-400">Time Left</p>
                    <p className={`font-semibold ${daysLeft <= 7 ? 'text-red-600' : 'text-green-700'}`}>{daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <span>💰</span>
                  <div>
                    <p className="text-xs text-gray-400">You Save</p>
                    <p className="font-semibold text-blue-700">₹{savings}</p>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-2">About this coupon</h3>
              <p className="text-gray-600 leading-relaxed">{coupon.description}</p>
            </div>
          </div>

          {/* Coupon code (after purchase or if owner) */}
          {(isOwner || (user?.isAdmin)) && coupon.code && coupon.code !== '••••••••' && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">🎟️ Coupon Code</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 border-2 border-dashed border-brand-300 rounded-xl px-5 py-4 text-center">
                  <span className="text-2xl font-black text-brand-700 tracking-widest">{coupon.code}</span>
                </div>
                <button onClick={copyCode} className={`px-5 py-4 rounded-xl font-semibold text-sm transition-all ${copied ? 'bg-green-600 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Purchase Success */}
          {success && (
            <div className="card p-6 border-2 border-green-300 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">✓</div>
                <div>
                  <h3 className="font-bold text-green-800 text-lg">Purchase Successful!</h3>
                  <p className="text-green-700 text-sm">Transaction ID: {success.transaction?.id?.slice(0, 8)}...</p>
                </div>
              </div>
              <p className="text-green-700 text-sm">The coupon code is now displayed above. You can also find it in your profile.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 space-y-5">
          {/* Buy box */}
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-5">
              <div className="text-3xl font-black text-gray-900">₹{coupon.sellingPrice}</div>
              <div className="text-sm text-gray-400 line-through mt-1">Original value ₹{coupon.originalValue}</div>
              <div className="inline-block bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full mt-2">
                You save ₹{savings} ({savingPct}% off)
              </div>
            </div>

            {isSold && !isPurchased && (
              <div className="text-center py-4 bg-gray-50 rounded-xl text-gray-500 text-sm font-medium">🚫 Already Sold</div>
            )}
            {isSold && isPurchased && (
              <div className="text-center py-4 bg-green-50 rounded-xl text-green-700 text-sm font-semibold">✓ You purchased this coupon</div>
            )}
            {coupon.sellerId === user?.id && (
              <div className="text-center py-4 bg-blue-50 rounded-xl text-blue-700 text-sm font-semibold">📌 Your listing</div>
            )}
            {!isSold && coupon.sellerId !== user?.id && coupon.status === 'verified' && (
              <>
                {!user ? (
                  <Link to="/login" className="btn-primary w-full text-center block">Sign In to Buy</Link>
                ) : (
                  <button onClick={() => setShowBuyModal(true)} className="btn-primary w-full">
                    Buy Now for ₹{coupon.sellingPrice}
                  </button>
                )}
                {error && !showBuyModal && <p className="text-red-600 text-sm mt-3 text-center">{error}</p>}
              </>
            )}
            {coupon.status === 'pending' && (
              <div className="text-center py-4 bg-yellow-50 rounded-xl text-yellow-700 text-sm font-semibold">⏳ Pending Admin Verification</div>
            )}
            {coupon.status === 'rejected' && (
              <div className="text-center py-4 bg-red-50 rounded-xl text-red-700 text-sm font-semibold">❌ Coupon Rejected</div>
            )}

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
              {[['🔒', 'Secure Payment', 'UPI protected transaction'],
                ['✅', 'Verified Coupon', 'Admin reviewed & approved'],
                ['💯', 'Satisfaction Guaranteed', 'Code works or full refund']].map(([icon, title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{title}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Complete Purchase</h2>
            <p className="text-gray-500 mb-6">You are buying: <strong>{coupon.title}</strong></p>

            <div className="bg-brand-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Coupon Price</span>
                <span className="font-bold text-gray-900">₹{coupon.sellingPrice}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
              <div className="border-t border-brand-200 mt-3 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-brand-600 text-lg">₹{coupon.sellingPrice}</span>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">⚠️ {error}</div>}

            <form onSubmit={handleBuy}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your UPI ID</label>
                <input className="input" placeholder="yourname@upi / phone@paytm" value={upiId}
                  onChange={e => setUpiId(e.target.value)} required />
                <p className="text-xs text-gray-400 mt-1">Payment will be processed to seller after delivery</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowBuyModal(false); setError(''); }}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={buyLoading} className="flex-1 btn-primary flex justify-center items-center gap-2">
                  {buyLoading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Processing...</> : `Pay ₹${coupon.sellingPrice}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
