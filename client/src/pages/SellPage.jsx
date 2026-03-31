import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const categories = ['Food & Dining', 'Travel', 'Fashion', 'Electronics', 'Entertainment', 'Health & Beauty', 'Groceries'];

export default function SellPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', brand: '', category: '', description: '', code: '', originalValue: '', sellingPrice: '', expiryDate: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const savingPct = form.originalValue && form.sellingPrice
    ? Math.round(((Number(form.originalValue) - Number(form.sellingPrice)) / Number(form.originalValue)) * 100)
    : 0;

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (Number(form.sellingPrice) >= Number(form.originalValue))
      return setError('Selling price must be less than original value');
    if (Number(form.sellingPrice) <= 0)
      return setError('Selling price must be greater than 0');

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await api.post('/coupons', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit coupon');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fadeIn">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">🎉</div>
      <h2 className="text-3xl font-black text-gray-900 mb-3">Coupon Submitted!</h2>
      <p className="text-gray-500 text-lg mb-4">Your coupon is under review. Once our admin verifies it (within 24h), it will appear live in the marketplace.</p>
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-8">
        ✉️ You'll be notified once your coupon is verified and ready to sell.
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={() => { setSuccess(false); setForm({ title: '', brand: '', category: '', description: '', code: '', originalValue: '', sellingPrice: '', expiryDate: '' }); setImage(null); setImagePreview(''); }}
          className="btn-secondary">Sell Another</button>
        <button onClick={() => navigate('/profile')} className="btn-primary">View My Listings</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">💰 Sell Your Coupon</h1>
        <p className="text-gray-500">List your unused coupons and earn cash. Our team verifies all submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[['📋', 'Fill Details', 'Enter coupon info accurately'],
          ['🔍', 'Admin Reviews', 'We verify within 24 hours'],
          ['💸', 'Start Earning', 'Buyers purchase & you get paid']].map(([icon, title, desc]) => (
          <div key={title} className="card p-4 flex items-start gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Title *</label>
              <input className="input" placeholder="e.g. Swiggy 50% off on first order" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand / Company *</label>
              <input className="input" placeholder="e.g. Swiggy, Amazon" value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea className="input h-20 resize-none" placeholder="Describe what this coupon offers, minimum order, etc."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
              <input className="input font-mono uppercase tracking-widest" placeholder="e.g. SAVE50NOW" value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              <p className="text-xs text-gray-400 mt-1">The actual code buyers will use. It will only be revealed after purchase.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Value (₹) *</label>
              <input type="number" className="input" placeholder="e.g. 200" min="1" value={form.originalValue}
                onChange={e => setForm({ ...form, originalValue: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Selling Price (₹) *</label>
              <input type="number" className="input" placeholder="e.g. 80" min="1" value={form.sellingPrice}
                onChange={e => setForm({ ...form, sellingPrice: e.target.value })} required />
              {savingPct > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-1">Buyer saves {savingPct}% — very attractive!</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
              <input type="date" className="input" value={form.expiryDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Screenshot (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('image-upload').click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-20 mx-auto rounded-lg object-contain" />
                ) : (
                  <>
                    <div className="text-3xl mb-2">📸</div>
                    <p className="text-sm text-gray-500">Click to upload coupon screenshot</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.title && form.brand && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-4 text-white">
                <div className="text-white/70 text-xs mb-1">{form.brand}</div>
                <div className="font-bold">{form.title}</div>
                {form.sellingPrice && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-black">₹{form.sellingPrice}</span>
                    {form.originalValue && <span className="text-white/60 line-through text-sm">₹{form.originalValue}</span>}
                    {savingPct > 0 && <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">Save {savingPct}%</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 text-base py-4">
            {loading ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Submitting...</> : '🚀 Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
