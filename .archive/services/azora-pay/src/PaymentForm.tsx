import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

function CheckoutForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/payment/success' },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
}

export default function PaymentForm({ userId, amount, description }: {
  userId: string;
  amount: number;
  description: string;
}) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const createPayment = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:3039/api/payments', {
        userId,
        amount,
        currency: 'usd',
        description
      });
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <button
        onClick={createPayment}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
      >
        {loading ? 'Loading...' : 'Continue to Payment'}
      </button>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm amount={amount} onSuccess={() => alert('Payment successful!')} />
    </Elements>
  );
}
