import { useState, useEffect } from 'react';
import PaymentForm from '../components/PaymentForm';
import TransactionHistory from '../components/TransactionHistory';

export default function PayDashboard() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch('/api/wallet/balance')
      .then(r => r.json())
      .then(data => setBalance(data.balance));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Azora Pay</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Balance</h2>
            <p className="text-3xl font-bold text-indigo-600">${balance.toFixed(2)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
            <PaymentForm onSuccess={() => window.location.reload()} />
          </div>
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
}
