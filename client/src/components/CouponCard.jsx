import React from 'react';
import { Link } from 'react-router-dom';

const categoryColors = {
  'Food & Dining': 'bg-orange-100 text-orange-700',
  'Travel': 'bg-blue-100 text-blue-700',
  'Fashion': 'bg-pink-100 text-pink-700',
  'Electronics': 'bg-purple-100 text-purple-700',
  'Entertainment': 'bg-yellow-100 text-yellow-700',
  'Health & Beauty': 'bg-green-100 text-green-700',
  'Groceries': 'bg-emerald-100 text-emerald-700',
};

const categoryEmoji = {
  'Food & Dining': '🍔',
  'Travel': '✈️',
  'Fashion': '👗',
  'Electronics': '📱',
  'Entertainment': '🎬',
  'Health & Beauty': '💆',
  'Groceries': '🛒',
};

const brandColors = {
  'Swiggy': 'from-orange-400 to-orange-600',
  'Zomato': 'from-red-400 to-red-600',
  'Amazon': 'from-yellow-400 to-orange-500',
  'Flipkart': 'from-blue-400 to-blue-600',
  'BookMyShow': 'from-red-500 to-red-700',
  'MakeMyTrip': 'from-cyan-400 to-blue-600',
  'Myntra': 'from-pink-400 to-pink-600',
  'Nykaa': 'from-rose-400 to-pink-600',
  'BigBasket': 'from-green-400 to-emerald-600',
  'Uber': 'from-gray-700 to-gray-900',
  'PharmEasy': 'from-teal-400 to-teal-600',
  'Cleartrip': 'from-indigo-400 to-blue-600',
  'Puma': 'from-gray-500 to-gray-700',
  'Ola': 'from-yellow-400 to-yellow-600',
  'Ajio': 'from-red-400 to-red-600',
};

function getDaysLeft(expiryDate) {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function CouponCard({ coupon }) {
  const savings = coupon.originalValue - coupon.sellingPrice;
  const savingPct = Math.round((savings / coupon.originalValue) * 100);
  const daysLeft = getDaysLeft(coupon.expiryDate);
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;
  const gradientClass = brandColors[coupon.brand] || 'from-brand-400 to-brand-600';

  return (
    <Link to={`/coupon/${coupon.id}`} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1 group block">
      {/* Top banner */}
      <div className={`bg-gradient-to-r ${gradientClass} p-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>

        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <span className="text-white/80 text-xs font-medium uppercase tracking-wider">{coupon.brand}</span>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              Save {savingPct}%
            </span>
          </div>
          <h3 className="text-white font-bold text-base leading-snug group-hover:underline">{coupon.title}</h3>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge ${categoryColors[coupon.category] || 'bg-gray-100 text-gray-600'}`}>
            {categoryEmoji[coupon.category]} {coupon.category}
          </span>
          {isExpiringSoon && !isExpired && (
            <span className="badge bg-amber-100 text-amber-700">⏰ Expiring soon</span>
          )}
          {isExpired && (
            <span className="badge bg-red-100 text-red-700">Expired</span>
          )}
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{coupon.description}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-gray-900">₹{coupon.sellingPrice}</span>
              <span className="text-sm text-gray-400 line-through">₹{coupon.originalValue}</span>
            </div>
            <p className="text-xs text-green-600 font-semibold">Save ₹{savings}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {isExpired ? 'Expired' : `${daysLeft}d left`}
            </p>
            <div className="mt-1 bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg group-hover:bg-brand-700 transition-colors">
              View Deal →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
