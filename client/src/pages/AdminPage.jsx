import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  sold: 'bg-blue-100 text-blue-700',
};

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, couponsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/coupons'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setCoupons(couponsRes.data);
      setUsers(usersRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await api.put(`/admin/coupons/${id}/${action}`);
      await fetchAll();
    } catch {}
    setActionLoading('');
  };

  const filteredCoupons = coupons.filter(c => activeTab === 'all' ? true : c.status === activeTab);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>)}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">⚙️ Admin Dashboard</h1>
        <p className="text-gray-500">Manage coupons, users and platform statistics</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ['👥', stats.totalUsers, 'Total Users', 'bg-blue-50 border-blue-200'],
            ['🎫', stats.totalCoupons, 'Total Coupons', 'bg-purple-50 border-purple-200'],
            ['⏳', stats.pendingCoupons, 'Pending Review', 'bg-yellow-50 border-yellow-200'],
            ['💰', `₹${stats.totalRevenue}`, 'Total Revenue', 'bg-green-50 border-green-200'],
          ].map(([icon, val, label, color]) => (
            <div key={label} className={`card p-5 border ${color}`}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-2xl font-black text-gray-900">{val}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {[['pending', '⏳ Pending', stats?.pendingCoupons],
          ['verified', '✅ Verified', stats?.verifiedCoupons],
          ['sold', '🏷️ Sold', stats?.soldCoupons],
          ['rejected', '❌ Rejected'],
          ['all', '📋 All'],
          ['users', '👥 Users']].map(([tab, label, count]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {label}{count !== undefined ? ` (${count})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Phone', 'Level', 'Points', 'Listings', 'Purchases', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0)}
                      </div>
                      {user.name}
                      {user.isAdmin && <span className="badge bg-red-100 text-red-700 text-xs">Admin</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-yellow-100 text-yellow-700">Lv.{user.level}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{user.points}</td>
                  <td className="px-4 py-3 text-gray-500">{user.listings?.length || 0}</td>
                  <td className="px-4 py-3 text-gray-500">{user.purchases?.length || 0}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCoupons.length === 0 && (
            <div className="text-center py-16 card">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="font-bold text-gray-700">No coupons in this category</h3>
            </div>
          )}
          {filteredCoupons.map(coupon => (
            <div key={coupon.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-gray-900">{coupon.title}</span>
                    <span className={`badge ${statusColors[coupon.status]}`}>{coupon.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                    <span>🏷️ {coupon.brand}</span>
                    <span>📂 {coupon.category}</span>
                    <span>💰 ₹{coupon.sellingPrice} (was ₹{coupon.originalValue})</span>
                    <span>📅 Exp: {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Seller: <strong>{coupon.sellerName}</strong> ({coupon.sellerEmail}) ·
                    Code: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{coupon.code}</code>
                  </div>
                </div>
                {coupon.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(coupon.id, 'verify')}
                      disabled={actionLoading === coupon.id + 'verify'}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                      {actionLoading === coupon.id + 'verify' ? '...' : '✓ Verify'}
                    </button>
                    <button
                      onClick={() => handleAction(coupon.id, 'reject')}
                      disabled={actionLoading === coupon.id + 'reject'}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                      {actionLoading === coupon.id + 'reject' ? '...' : '✕ Reject'}
                    </button>
                  </div>
                )}
                {coupon.status === 'verified' && (
                  <button
                    onClick={() => handleAction(coupon.id, 'reject')}
                    disabled={actionLoading === coupon.id + 'reject'}
                    className="text-sm text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl transition-colors shrink-0">
                    Revoke
                  </button>
                )}
                {coupon.status === 'rejected' && (
                  <button
                    onClick={() => handleAction(coupon.id, 'verify')}
                    disabled={actionLoading === coupon.id + 'verify'}
                    className="text-sm text-green-600 hover:bg-green-50 border border-green-200 px-4 py-2 rounded-xl transition-colors shrink-0">
                    Re-verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
