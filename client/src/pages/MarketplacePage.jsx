import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import CouponCard from '../components/CouponCard';

const categories = ['All', 'Food & Dining', 'Travel', 'Fashion', 'Electronics', 'Entertainment', 'Health & Beauty', 'Groceries'];
const sortOptions = [
  { value: '', label: 'Newest First' },
  { value: 'value_desc', label: 'Highest Value' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'expiry', label: 'Expiring Soon' },
];

export default function MarketplacePage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const [localSearch, setLocalSearch] = useState(search);

  const fetchCoupons = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);

    api.get(`/coupons?${params}`).then(res => setCoupons(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [category, search, sort]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== 'All') p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  const handleSearch = e => {
    e.preventDefault();
    updateParam('search', localSearch);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Coupon Marketplace</h1>
        <p className="text-gray-500">{loading ? '...' : `${coupons.length} deals available`}</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input className="input pl-11 pr-4" placeholder="Search brands, categories…"
            value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary px-6 py-3">Search</button>
        {(search || category !== 'All' || sort) && (
          <button type="button" onClick={() => { setLocalSearch(''); setSearchParams({}); }}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-medium">
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="card p-5 sticky top-24">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Category</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button key={cat} onClick={() => updateParam('category', cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Sort By</h3>
              <div className="space-y-1">
                {sortOptions.map(opt => (
                  <button key={opt.value} onClick={() => updateParam('sort', opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sort === opt.value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-28 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-500 mb-6">Try a different search or category</p>
              <Link to="/sell" className="btn-primary">Be the first to sell one!</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {coupons.map(c => <CouponCard key={c.id} coupon={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
