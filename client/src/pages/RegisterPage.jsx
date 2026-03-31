import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name, email: form.email, phone: form.phone, password: form.password });
      setDevOtp(res.data.devOtp || '');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { name: form.name, email: form.email, phone: form.phone, password: form.password, otp: form.otp });
      login(res.data.token, res.data.user);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-3xl mb-6">
            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">Q</span>
            </div>
            <span className="gradient-text">Qupon</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join India's biggest coupon marketplace</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div className={`flex-1 h-2 rounded-full transition-colors ${step >= s ? 'bg-brand-600' : 'bg-gray-200'}`}></div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-6 -mt-4">
          <span className={step >= 1 ? 'text-brand-600 font-semibold' : ''}>Account Details</span>
          <span className={step >= 2 ? 'text-brand-600 font-semibold' : ''}>Verify OTP</span>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input className="input" placeholder="Rahul Sharma" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" className="input" placeholder="9876543210" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" className="input" placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input type="password" className="input" placeholder="Re-enter password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Sending OTP...</> : 'Send OTP →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">📧 OTP Sent!</p>
                <p>A verification code was sent to <strong>{form.email}</strong></p>
                {devOtp && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-lg p-2 text-yellow-800">
                    <strong>Dev Mode OTP: {devOtp}</strong>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                <input className="input text-center text-2xl tracking-[0.5em] font-bold" placeholder="● ● ● ● ● ●"
                  maxLength={6} value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} required />
              </div>
              <button type="submit" disabled={loading || form.otp.length !== 6} className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Verifying...</> : 'Verify & Create Account ✓'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                ← Go back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
