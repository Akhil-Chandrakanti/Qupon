import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  sold: 'bg-blue-100 text-blue-700',
};

const levelInfo = {
  1: { name: 'Bronze', icon: '🥉', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500', next: 100 },
  2: { name: 'Silver', icon: '🥈', color: 'text-gray-600', bg: 'bg-gray-50', bar: 'bg-gray-500', next: 300 },
  3: { name: 'Gold', icon: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-50', bar: 'bg-yellow-500', next: 800 },
  4: { name: 'Platinum', icon: '💎', color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-500', next: 2000 },
  5: { name: 'Diamond', icon: '✨', color: 'text-cyan-600', bg: 'bg-cyan-50', bar: 'bg-cyan-500', next: 9999 },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-2xl mb-6"></div>
    </div>
  );

  if (!profile) return null;

  const level = levelInfo[profile.level] || levelInfo[1];
  const prevLevelPts = { 1: 0, 2: 100, 3: 300, 4: 800, 5: 2000 }[profile.level] || 0;
  const progressPct = profile.level === 5 ? 100 : Math.min(100, Math.round(((profile.points - prevLevelPts) / (level.next - prevLevelPts)) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900">{profile.name}</h1>
              <span className={`badge ${level.bg} ${level.color} text-sm font-bold px-3 py-1`}>
                {level.icon} {level.name}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{profile.email} · {profile.phone}</p>
            <p className="text-xs text-gray-400 mt-0.5">Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{profile.points} pts</span>
                {profile.level < 5 && <span>{level.next} pts to {levelInfo[profile.level + 1]?.name}</span>}
                {profile.level === 5 && <span>Max Level!</span>}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${level.bar} rounded-full transition-all`} style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              ['🎫', profile.purchases?.length || 0, 'Purchased'],
              ['📋', profile.listings?.length || 0, 'Listed'],
              ['⭐', profile.points || 0, 'Points'],
            ].map(([icon, val, label]) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                <div className="text-lg mb-0.5">{icon}</div>
                <div className="text-xl font-black text-gray-900">{val}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[['purchases', '🛒 Purchases'], ['listings', '📋 My Listings'], ['transactions', '💳 Transactions']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'purchases' && (
        <div>
          {profile.purchases?.length === 0 ? (
            <div className="text-center py-16 card">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="font-bold text-gray-900 mb-2">No purchases yet</h3>
              <p className="text-gray-500 mb-4">Browse the marketplace for great deals!</p>
              <Link to="/marketplace" className="btn-primary">Explore Deals</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.purchases.map(coupon => (
                <div key={coupon.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{coupon.title}</p>
                      <p className="text-sm text-gray-500">{coupon.brand}</p>
                    </div>
                    <span className={`badge ${statusColors[coupon.status]}`}>{coupon.status}</span>
                  </div>
                  <div className="bg-gray-50 border-2 border-dashed border-brand-300 rounded-xl px-4 py-3 text-center mb-3">
                    <span className="font-black text-brand-700 tracking-widest text-lg">{coupon.code}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Paid ₹{coupon.sellingPrice}</span>
                    <span>Expires {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'listings' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{profile.listings?.length} coupon(s) listed</p>
            <Link to="/sell" className="btn-primary text-sm py-2 px-4">+ List New Coupon</Link>
          </div>
          {profile.listings?.length === 0 ? (
            <div className="text-center py-16 card">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-4">Sell your unused coupons and earn cash!</p>
              <Link to="/sell" className="btn-primary">Sell a Coupon</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.listings.map(coupon => (
                <div key={coupon.id} className="card p-5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{coupon.title}</span>
                      <span className={`badge ${statusColors[coupon.status]}`}>{coupon.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{coupon.brand} · {coupon.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">₹{coupon.sellingPrice}</div>
                    <div className="text-xs text-gray-400">listed</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          {profile.transactions?.length === 0 ? (
            <div className="text-center py-16 card">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="font-bold text-gray-900 mb-2">No transactions yet</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.transactions.map(tx => {
                const isBuyer = tx.buyerId === profile.id;
                return (
                  <div key={tx.id} className="card p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isBuyer ? 'bg-red-100' : 'bg-green-100'}`}>
                      {isBuyer ? '💸' : '💰'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{isBuyer ? 'Purchase' : 'Sale'}</p>
                      <p className="text-xs text-gray-400">TX: {tx.id.slice(0, 12)}... · {new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className={`font-bold text-lg ${isBuyer ? 'text-red-600' : 'text-green-600'}`}>
                      {isBuyer ? '-' : '+'}₹{tx.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
