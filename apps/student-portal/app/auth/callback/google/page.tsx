'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, setAuthToken, setUser } from '../../../packages/lib/auth-service';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Exchange code for token
        const response = await authService.handleGoogleCallback(code);

        if (response.success && response.token && response.user) {
          // Store authentication data
          setAuthToken(response.token);
          setUser(response.user);

          setStatus('success');
          setMessage('Successfully signed in with Google!');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(response.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img src="/branding/logo-primary.svg" alt="Azora" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Signing you in...</h2>
        </div>

        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center">
            {status === 'loading' && (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Processing your Google sign-in...</span>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-800 font-medium">{message}</p>
                <p className="text-sm text-gray-600 mt-2">Redirecting to your dashboard...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-800 font-medium">Authentication Failed</p>
                <p className="text-sm text-gray-600 mt-2">{message}</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* OAuth Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Secure OAuth Integration</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Your Google account is securely connected to Azora OS for enhanced learning and workspace features.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}