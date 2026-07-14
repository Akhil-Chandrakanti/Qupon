import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBrandLogoUrl } from '../utils/brandLogo';
import { getUploadedImageUrl } from '../utils/imageUrl';

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
  const uploadedImage = getUploadedImageUrl(coupon.image);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = getBrandLogoUrl(coupon.brand);

  return (
    <Link to={`/coupon/${coupon.id}`} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1 group block bg-white overflow-hidden">
      {/* Seller-uploaded photo, if any, sits as a plain image banner (no colored overlay) */}
      {uploadedImage && (
        <img src={uploadedImage} alt={coupon.title} className="w-full h-40 object-cover" />
      )}

      {/* Header: logo + brand + title, plain white background */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          {!logoFailed && logoUrl ? (
            <img src={logoUrl} alt={coupon.brand} className="h-9 max-w-[140px] object-contain object-left"
              onError={() => setLogoFailed(true)} />
          ) : (
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{coupon.brand}</span>
          )}
          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-full shrink-0">
            Save {savingPct}%
          </span>
        </div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{coupon.brand}</p>
        <h3 className="text-gray-900 font-bold text-base leading-snug group-hover:underline">{coupon.title}</h3>
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
