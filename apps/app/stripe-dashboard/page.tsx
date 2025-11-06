'use client';

import { useEffect, useState } from 'react';

interface StripeData {
  account: any;
  balance: any;
  charges: any[];
  paymentIntents: any[];
  customers: any[];
  apiKeys: {
    secret_key: string;
    publishable_key: string;
    restricted_key: string;
    payments_profile_id: string;
    webhook_secret: string;
  };
  profile: {
    id: string;
    email: string;
  };
}

export default function StripeDashboard() {
  const [data, setData] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stripe/account')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Stripe Dashboard</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Stripe Dashboard</h1>
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stripe Dashboard</h1>

        {/* Profile Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payments Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Profile ID</label>
              <p className="text-lg">{data?.profile.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Primary Contact Email</label>
              <p className="text-lg">{data?.profile.email}</p>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Keys Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Secret Key</label>
              <p className={`text-lg ${data?.apiKeys.secret_key === 'Configured' ? 'text-green-400' : 'text-red-400'}`}>
                {data?.apiKeys.secret_key}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Publishable Key</label>
              <p className={`text-lg ${data?.apiKeys.publishable_key === 'Configured' ? 'text-green-400' : 'text-red-400'}`}>
                {data?.apiKeys.publishable_key}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Restricted Key</label>
              <p className={`text-lg ${data?.apiKeys.restricted_key === 'Configured' ? 'text-green-400' : 'text-red-400'}`}>
                {data?.apiKeys.restricted_key}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Payments Profile ID</label>
              <p className="text-lg">{data?.apiKeys.payments_profile_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Webhook Secret</label>
              <p className="text-lg">{data?.apiKeys.webhook_secret}</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        {data?.account && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Account ID</label>
                <p className="text-lg">{data.account.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Business Name</label>
                <p className="text-lg">{data.account.business_profile?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Country</label>
                <p className="text-lg">{data.account.country}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Currency</label>
                <p className="text-lg">{data.account.default_currency?.toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Balance */}
        {data?.balance && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Account Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.balance.available.map((balance: any) => (
                <div key={balance.currency} className="bg-gray-700 rounded p-4">
                  <label className="block text-sm font-medium text-gray-400">Available ({balance.currency.toUpperCase()})</label>
                  <p className="text-2xl font-bold">{(balance.amount / 100).toFixed(2)}</p>
                </div>
              ))}
              {data.balance.pending.map((balance: any) => (
                <div key={balance.currency} className="bg-gray-700 rounded p-4">
                  <label className="block text-sm font-medium text-gray-400">Pending ({balance.currency.toUpperCase()})</label>
                  <p className="text-2xl font-bold">{(balance.amount / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Charges */}
        {data?.charges && data.charges.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Charges</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Currency</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.charges.map((charge: any) => (
                    <tr key={charge.id} className="border-b border-gray-700">
                      <td className="p-2">{charge.id}</td>
                      <td className="p-2">{(charge.amount / 100).toFixed(2)}</td>
                      <td className="p-2">{charge.currency.toUpperCase()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          charge.status === 'succeeded' ? 'bg-green-600' :
                          charge.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                        }`}>
                          {charge.status}
                        </span>
                      </td>
                      <td className="p-2">{charge.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Payment Intents */}
        {data?.paymentIntents && data.paymentIntents.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Payment Intents</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Currency</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentIntents.map((pi: any) => (
                    <tr key={pi.id} className="border-b border-gray-700">
                      <td className="p-2">{pi.id}</td>
                      <td className="p-2">{(pi.amount / 100).toFixed(2)}</td>
                      <td className="p-2">{pi.currency.toUpperCase()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          pi.status === 'succeeded' ? 'bg-green-600' :
                          pi.status === 'requires_payment_method' ? 'bg-yellow-600' :
                          pi.status === 'canceled' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {pi.status}
                        </span>
                      </td>
                      <td className="p-2">{pi.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Customers */}
        {data?.customers && data.customers.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Customers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer: any) => (
                    <tr key={customer.id} className="border-b border-gray-700">
                      <td className="p-2">{customer.id}</td>
                      <td className="p-2">{customer.email || 'N/A'}</td>
                      <td className="p-2">{customer.name || 'N/A'}</td>
                      <td className="p-2">{new Date(customer.created * 1000).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}