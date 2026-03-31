import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const levelBadge = {
  1: { label: 'Bronze', color: 'bg-amber-100 text-amber-700' },
  2: { label: 'Silver', color: 'bg-gray-100 text-gray-700' },
  3: { label: 'Gold', color: 'bg-yellow-100 text-yellow-700' },
  4: { label: 'Platinum', color: 'bg-blue-100 text-blue-700' },
  5: { label: 'Diamond', color: 'bg-cyan-100 text-cyan-700' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-black text-2xl">
            <img src={logo} alt="logo" className="w-10 h-10 object-contain" />
            <span className="gradient-text">Qupon</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/marketplace" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/marketplace') ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              🏪 Marketplace
            </Link>
            {user && (
              <Link to="/sell" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/sell') ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                💰 Sell Coupon
              </Link>
            )}
            {user?.isAdmin && (
              <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                ⚙️ Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{user.name?.split(' ')[0]}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${levelBadge[user.level]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {levelBadge[user.level]?.label || 'Bronze'}
                    </span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu btn */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-600 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-600 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            <Link to="/marketplace" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">🏪 Marketplace</Link>
            {user && <Link to="/sell" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">💰 Sell Coupon</Link>}
            {user?.isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">⚙️ Admin</Link>}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">👤 Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
