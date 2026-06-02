'use client';

import { useState } from 'react';

export default function CheckoutButton({
  planId,
  planName,
}: {
  planId: string;
  planName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to initialize checkout');
      }

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No authorization URL returned from payment server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-auto">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full h-12 bg-emerald-400 hover:bg-emerald-500 text-dark border-[3px] border-dark rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 shadow-[4px_4px_0px_#060E1C] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? 'Redirecting to Paystack...' : `Choose ${planName}`}
      </button>
      {error && (
        <p className="mt-2 text-xs font-bold text-rose-600 bg-rose-50 border-[2px] border-dark p-2 rounded-xl text-center">
          ❌ {error}
        </p>
      )}
    </div>
  );
}
