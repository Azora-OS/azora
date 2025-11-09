'use client';
import { useEffect, useState } from 'react';
import { getStoredApiConfig, saveApiConfig, testHealth } from '../lib/api-config';

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; status?: number; error?: string }>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cfg = getStoredApiConfig();
    setBaseUrl(cfg.baseUrl || '');
  }, []);

  const onTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testHealth(baseUrl);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveApiConfig({ baseUrl: baseUrl.trim().replace(/\/$/, '') });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Azora Backend API URL</label>
              <input
                type="url"
                placeholder="http://localhost:3001"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Saved to your browser only. Used by all requests in this app.</p>
            </div>

            {testResult && (
              <div className={`p-3 rounded border text-sm ${testResult.ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {testResult.ok ? (
                  <span>✅ Connected (status {testResult.status})</span>
                ) : (
                  <span>❌ Not responding {testResult.status ? `(status ${testResult.status})` : ''} {testResult.error ? `- ${testResult.error}` : ''}</span>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onTest}
                disabled={testing || !baseUrl}
                className="bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              {saved && <span className="self-center text-green-600 text-sm">Saved ✓</span>}
            </div>
          </form>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>No API? No problem. You can leave the field empty to use demo data. Configure later from the Settings page.</p>
        </div>
      </div>
    </div>
  );
}
