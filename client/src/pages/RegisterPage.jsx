import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleDetailsSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name, email: form.email, phone: form.phone, password: form.password
      });
      setInfo(`We've sent a 6-digit code to ${form.email}`);
      setStep('otp');
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();
    setError('');
    if (otp.trim().length !== 6) return setError('Enter the 6-digit code from your email');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: otp.trim() });
      login(res.data.token, res.data.user);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setInfo('');
    try {
      await api.post('/auth/resend-otp', { email: form.email });
      setInfo('A new code has been sent to your email');
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
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
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'details' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 'details' ? "Join India's biggest coupon marketplace" : 'Enter the code we emailed you'}
          </p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {info && !error && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <span>✉️</span> {info}
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
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
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Sending code...</> : 'Send Verification Code →'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                <input className="input text-center text-2xl tracking-[0.5em] font-bold" placeholder="000000"
                  inputMode="numeric" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>Verifying...</> : 'Verify & Create Account →'}
              </button>
              <div className="flex items-center justify-between text-sm pt-1">
                <button type="button" onClick={() => { setStep('details'); setError(''); setInfo(''); }}
                  className="text-gray-500 hover:text-gray-700">
                  ← Edit details
                </button>
                <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
                  className="text-brand-600 font-semibold hover:underline disabled:text-gray-300 disabled:no-underline">
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                </button>
              </div>
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
