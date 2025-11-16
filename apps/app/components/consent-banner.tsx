'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { X } from 'lucide-react';

export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

interface ConsentBannerProps {
  onConsent?: (preferences: ConsentPreferences) => void;
  onDismiss?: () => void;
}

export function ConsentBanner({ onConsent, onDismiss }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem('consent-preferences');
    if (!consentGiven) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    handleConsent(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    handleConsent(minimalConsent);
  };

  const handleConsent = (prefs: ConsentPreferences) => {
    localStorage.setItem('consent-preferences', JSON.stringify(prefs));
    setIsVisible(false);
    onConsent?.(prefs);
  };

  const handleSavePreferences = () => {
    handleConsent(preferences);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!showDetails ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Privacy & Cookie Consent
              </h3>
              <p className="text-sm text-gray-600">
                We use cookies and similar technologies to enhance your experience, analyze usage, and support our marketing efforts. 
                <a href="/docs/PRIVACY-POLICY.md" className="text-blue-600 hover:underline ml-1">
                  Learn more
                </a>
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Your Consent Preferences
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Checkbox
                  id="essential"
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="essential" className="font-medium text-gray-900">
                    Essential Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Required for basic functionality and security. Cannot be disabled.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="analytics" className="font-medium text-gray-900">
                    Analytics Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Help us understand how you use our platform to improve performance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Checkbox
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="marketing" className="font-medium text-gray-900">
                    Marketing Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Used to track your interests and show relevant content and ads.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Checkbox
                  id="personalization"
                  checked={preferences.personalization}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, personalization: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="personalization" className="font-medium text-gray-900">
                    Personalization Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Remember your preferences and customize your experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          {showDetails ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
              >
                Back
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Preferences
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleRejectAll}
              >
                Reject All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetails(true)}
              >
                Customize
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Accept All
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
