import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import CouponCard from '../components/CouponCard';

const categories = [
  { name: 'Food & Dining', emoji: '🍔', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { name: 'Travel', emoji: '✈️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'Fashion', emoji: '👗', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { name: 'Electronics', emoji: '📱', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { name: 'Entertainment', emoji: '🎬', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { name: 'Health & Beauty', emoji: '💆', color: 'bg-green-50 border-green-200 text-green-700' },
  { name: 'Groceries', emoji: '🛒', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const steps = [
  { icon: '📋', title: 'List Your Coupon', desc: 'Upload unused coupons with code, value and expiry. Our team verifies it within 24h.' },
  { icon: '🔍', title: 'Buyers Discover', desc: 'Shoppers browse verified coupons by brand, category or discount amount.' },
  { icon: '💳', title: 'Secure Payment', desc: 'Buyers pay via UPI. Funds are held securely until coupon delivery.' },
  { icon: '🎉', title: 'Everyone Saves', desc: 'Sellers earn cash, buyers save money. Earn loyalty points with every deal.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/coupons?sort=value_desc').then(res => setFeatured(res.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              India's #1 Coupon Marketplace
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Turn Unused Coupons<br />
              <span className="gradient-text">Into Real Money</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              Buy verified discount coupons at up to 70% off, or sell your unused ones for instant cash. Zero waste, maximum savings.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace" className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-brand-600/30 hover:shadow-xl active:scale-95">
                Browse Deals →
              </Link>
              <Link to="/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 backdrop-blur-sm">
                Start Selling
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              {[['15K+', 'Coupons Listed'], ['8K+', 'Happy Users'], ['₹50L+', 'Saved by Buyers'], ['4.8★', 'App Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-sm text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Shop by Category</h2>
            <p className="text-gray-500">Find deals on your favorite brands</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map(cat => (
              <Link key={cat.name} to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${cat.color} hover:scale-105 transition-transform text-center`}>
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Coupons */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-1">🔥 Top Deals</h2>
              <p className="text-gray-500">Highest value coupons available now</p>
            </div>
            <Link to="/marketplace" className="btn-secondary text-sm py-2 px-5">View All</Link>
          </div>
          {featured.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(c => <CouponCard key={c.id} coupon={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900 mb-3">How Qupon Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">A simple, secure way to buy and sell discount coupons</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-200 z-0"></div>
                )}
                <div className="relative z-10 w-16 h-16 bg-brand-50 border-2 border-brand-200 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Level System */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black mb-4">Unlock Rewards with Every Deal 🏆</h2>
              <p className="text-brand-100 text-lg mb-6">Earn loyalty points on every transaction. Level up from Bronze to Diamond and unlock exclusive benefits and priority verification.</p>
              <Link to="/register" className="bg-white text-brand-600 hover:bg-gray-50 font-bold px-8 py-3 rounded-xl inline-block transition-colors">
                Join for Free
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Bronze', pts: '0', icon: '🥉', color: 'bg-amber-100 text-amber-800' },
                { label: 'Silver', pts: '100', icon: '🥈', color: 'bg-gray-100 text-gray-800' },
                { label: 'Gold', pts: '300', icon: '🥇', color: 'bg-yellow-100 text-yellow-800' },
                { label: 'Platinum', pts: '800', icon: '💎', color: 'bg-blue-100 text-blue-800' },
                { label: 'Diamond', pts: '2000', icon: '✨', color: 'bg-cyan-100 text-cyan-800' },
              ].map(l => (
                <div key={l.label} className={`${l.color} rounded-2xl p-3 text-center`}>
                  <div className="text-2xl mb-1">{l.icon}</div>
                  <div className="text-xs font-bold">{l.label}</div>
                  <div className="text-xs opacity-70">{l.pts}pts</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Ready to Start Saving?</h2>
          <p className="text-xl text-gray-500 mb-8">Join thousands of smart shoppers buying and selling coupons on Qupon.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/marketplace" className="btn-primary text-base px-10">Explore Marketplace</Link>
            <Link to="/register" className="btn-secondary text-base px-10">Create Free Account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
