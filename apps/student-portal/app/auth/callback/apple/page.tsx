'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-service';

export default function AppleCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState('Processing Apple authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const user = urlParams.get('user'); // Apple provides user data in form post

        if (!code) {
          setStatus('No authorization code received from Apple');
          return;
        }

        // Exchange code for token
        const response = await fetch('/api/auth/apple/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, user }),
        });

        const data = await response.json();

        if (data.success) {
          login(data.token, data.user);
          setStatus('Successfully authenticated with Apple! Redirecting...');
          setTimeout(() => router.push('/dashboard'), 2000);
        } else {
          setStatus(`Authentication failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Apple OAuth callback error:', error);
        setStatus('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12">
            {/* Apple logo placeholder */}
            <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg"></span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Apple Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}