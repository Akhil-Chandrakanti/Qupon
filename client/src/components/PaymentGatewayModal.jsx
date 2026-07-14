import React, { useEffect, useRef, useState } from 'react';

// Generates a deterministic-looking but purely decorative QR pattern.
// This is NOT a real QR code - it's a visual simulation for the demo payment flow.
function FakeQRCode({ seed }) {
  const size = 21;
  const cells = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < size * size; i++) cells.push(rand() > 0.55);

  // Force the three finder squares (corners) to look QR-like
  const isFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-44 h-44 sm:w-52 sm:h-52">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        if (isFinder(r, c)) return null;
        return on ? <rect key={i} x={c} y={r} width={1} height={1} fill="#111827" /> : null;
      })}
      {[[0, 0], [0, size - 7], [size - 7, 0]].map(([ry, rx], idx) => (
        <g key={idx} transform={`translate(${rx},${ry})`}>
          <rect width={7} height={7} fill="#111827" />
          <rect x={1} y={1} width={5} height={5} fill="white" />
          <rect x={2} y={2} width={3} height={3} fill="#111827" />
        </g>
      ))}
    </svg>
  );
}

function CardBrandIcon({ brand }) {
  const styles = {
    visa: 'text-blue-600',
    mastercard: 'text-orange-500',
    rupay: 'text-emerald-600',
    unknown: 'text-gray-300'
  };
  const labels = { visa: 'VISA', mastercard: 'MasterCard', rupay: 'RuPay', unknown: '' };
  if (brand === 'unknown') return null;
  return <span className={`text-xs font-black tracking-wide ${styles[brand]}`}>{labels[brand]}</span>;
}

function detectCardBrand(number) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^6/.test(n)) return 'rupay';
  return 'unknown';
}

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const v = value.replace(/\D/g, '').slice(0, 4);
  if (v.length <= 2) return v;
  return `${v.slice(0, 2)}/${v.slice(2)}`;
}

/**
 * Fully simulated payment gateway (Razorpay-style UI).
 * No real payment processing happens here - this is a demo checkout flow only.
 * On "success" it calls onComplete(payerRef) which the parent uses to finalize the order.
 */
export default function PaymentGatewayModal({ amount, title, onComplete, onCancel }) {
  const [method, setMethod] = useState('upi'); // 'upi' | 'card'
  const [upiMode, setUpiMode] = useState('qr'); // 'qr' | 'id'
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [formError, setFormError] = useState('');
  const [phase, setPhase] = useState('form'); // 'form' | 'processing' | 'success' | 'failed'
  const [qrSeed] = useState(() => Math.floor(Math.random() * 100000));
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Simulate the QR getting "scanned & paid" automatically after a few seconds,
  // like a real UPI app confirming payment via webhook.
  useEffect(() => {
    if (method === 'upi' && upiMode === 'qr' && phase === 'form') {
      const t = setTimeout(() => runFakePayment(`upi_qr_${qrSeed}@fakebank`), 4000);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
  }, [method, upiMode, phase]);

  function runFakePayment(payerRef) {
    setFormError('');
    setPhase('processing');
    const t = setTimeout(() => {
      setPhase('success');
      const t2 = setTimeout(() => onComplete(payerRef), 900);
      timers.current.push(t2);
    }, 1800);
    timers.current.push(t);
  }

  const handleUpiIdSubmit = e => {
    e.preventDefault();
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      return setFormError('Enter a valid UPI ID, e.g. name@okhdfcbank');
    }
    runFakePayment(upiId.trim());
  };

  const handleCardSubmit = e => {
    e.preventDefault();
    const digits = card.number.replace(/\s/g, '');
    if (digits.length !== 16) return setFormError('Enter a valid 16-digit card number');
    if (!card.name.trim()) return setFormError('Enter the name on your card');
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return setFormError('Enter a valid expiry (MM/YY)');
    const [mm, yy] = card.expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) return setFormError('Enter a valid expiry month');
    if (card.cvv.length < 3) return setFormError('Enter a valid CVV');
    runFakePayment(`card_${digits.slice(-4)}`);
  };

  const brand = detectCardBrand(card.number);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        {/* Header - mimics a payment gateway checkout bar */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center font-black text-sm">Q</div>
            <div>
              <p className="text-sm font-semibold leading-none">Qupon Secure Checkout</p>
              <p className="text-[11px] text-gray-400 mt-1">🔒 256-bit encrypted · demo mode</p>
            </div>
          </div>
          {phase === 'form' && (
            <button onClick={onCancel} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
          )}
        </div>

        <div className="px-6 pt-4 pb-1 flex items-baseline justify-between border-b border-gray-100">
          <p className="text-sm text-gray-500 truncate max-w-[70%]">{title}</p>
          <p className="text-xl font-black text-gray-900">₹{amount}</p>
        </div>

        {phase === 'processing' && (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin mb-5"></div>
            <p className="font-semibold text-gray-800">Processing your payment...</p>
            <p className="text-sm text-gray-400 mt-1">Do not close or refresh this window</p>
          </div>
        )}

        {phase === 'success' && (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl mb-4 animate-fadeIn">✓</div>
            <p className="font-bold text-green-700 text-lg">Payment Successful</p>
            <p className="text-sm text-gray-400 mt-1">Confirming your order...</p>
          </div>
        )}

        {phase === 'form' && (
          <>
            {/* Method tabs */}
            <div className="flex border-b border-gray-100 px-6 pt-4 gap-6">
              {[['upi', '📲 UPI'], ['card', '💳 Card']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setMethod(key); setFormError(''); }}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    method === key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {formError && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">⚠️ {formError}</div>
              )}

              {method === 'upi' && (
                <div>
                  <div className="flex gap-2 mb-5">
                    <button onClick={() => setUpiMode('qr')}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${upiMode === 'qr' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      Scan QR Code
                    </button>
                    <button onClick={() => setUpiMode('id')}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${upiMode === 'id' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      Enter UPI ID
                    </button>
                  </div>

                  {upiMode === 'qr' ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 border-2 border-dashed border-gray-200 rounded-2xl">
                        <FakeQRCode seed={qrSeed} />
                      </div>
                      <p className="text-sm text-gray-500 mt-4">Scan with any UPI app</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 font-semibold">
                        <span>GPay</span>·<span>PhonePe</span>·<span>Paytm</span>·<span>BHIM</span>
                      </div>
                      <div className="flex items-center gap-2 mt-5 text-sm text-gray-400">
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
                        Waiting for payment confirmation...
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpiIdSubmit}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your UPI ID</label>
                      <input className="input" placeholder="yourname@okhdfcbank" value={upiId}
                        onChange={e => setUpiId(e.target.value)} required />
                      <button type="submit" className="btn-primary w-full mt-5">
                        Pay ₹{amount}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {method === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="relative">
                      <input className="input pr-16" placeholder="1234 5678 9012 3456" inputMode="numeric"
                        value={card.number}
                        onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })} required />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <CardBrandIcon brand={brand} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                    <input className="input" placeholder="RAHUL SHARMA" value={card.name}
                      onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry (MM/YY)</label>
                      <input className="input" placeholder="MM/YY" inputMode="numeric" value={card.expiry}
                        onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input className="input" placeholder="123" type="password" inputMode="numeric" maxLength={4}
                        value={card.cvv}
                        onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-2">
                    Pay ₹{amount}
                  </button>
                </form>
              )}

              <p className="text-center text-[11px] text-gray-300 mt-5">
                This is a simulated checkout for demo purposes. No real card or bank details are transmitted or stored.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
