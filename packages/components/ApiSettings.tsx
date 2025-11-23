/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { getUserApiEndpoint, setUserApiEndpoint } from '../lib/api-client';

interface ApiSettingsProps {
  serviceName: string;
  serviceDisplayName: string;
  defaultUrl?: string;
  placeholder?: string;
  description?: string;
  className?: string;
}

export function ApiSettings({
  serviceName,
  serviceDisplayName,
  defaultUrl = '',
  placeholder = 'https://api.example.com',
  description,
  className = ''
}: ApiSettingsProps) {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; status?: number; error?: string }>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedUrl = getUserApiEndpoint(serviceName);
    setUrl(savedUrl || defaultUrl);
  }, [serviceName, defaultUrl]);

  const handleTest = async () => {
    if (!url.trim()) {return;}

    setTesting(true);
    setTestResult(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${url.replace(/\/$/, '')}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeout);
      setTestResult({ ok: response.ok, status: response.status });
    } catch (error: any) {
      setTestResult({
        ok: false,
        error: error.name === 'AbortError' ? 'Timeout (5s)' : error.message || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const trimmedUrl = url.trim();
    setUserApiEndpoint(serviceName, trimmedUrl || null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setUrl('');
    setUserApiEndpoint(serviceName, null);
    setTestResult(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`bg-white p-6 rounded-lg border shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {serviceDisplayName} API
        </h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Endpoint URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use demo data. Saved to browser only.
          </p>
        </div>

        {testResult && (
          <div className={`p-3 rounded-md border text-sm ${
            testResult.ok
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {testResult.ok ? (
              <span>✅ Connected (status {testResult.status})</span>
            ) : (
              <span>❌ {testResult.error || `Status ${testResult.status}`}</span>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={testing || !url.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Save
          </button>

          {url && (
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
            >
              Clear
            </button>
          )}

          {saved && (
            <span className="self-center text-green-600 text-sm font-medium">
              ✓ Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Settings page component that can be used by all apps
interface ApiSettingsPageProps {
  appName: string;
  services: Array<{
    name: string;
    displayName: string;
    description?: string;
    defaultUrl?: string;
  }>;
  className?: string;
}

export function ApiSettingsPage({ appName, services, className = '' }: ApiSettingsPageProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {appName} - API Settings
          </h1>
          <p className="text-gray-600">
            Configure API endpoints for {appName}. Leave fields empty to use demo data.
            All settings are saved locally in your browser.
          </p>
        </div>

        <div className="space-y-6">
          {services.map((service) => (
            <ApiSettings
              key={service.name}
              serviceName={service.name}
              serviceDisplayName={service.displayName}
              description={service.description}
              defaultUrl={service.defaultUrl}
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            💡 Demo Mode
          </h3>
          <p className="text-sm text-blue-800">
            {appName} works perfectly without any APIs configured. It will show realistic demo data
            and allow you to explore all features. Configure APIs later when you're ready to connect
            to real services.
          </p>
        </div>
      </div>
    </div>
  );
}