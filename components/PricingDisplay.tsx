/**
 * PRICING DISPLAY COMPONENT
 * 
 * Automatically detects user location and displays prices in local currency
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  getPricingForUser,
  formatPrice,
  getHeroText,
  getPaymentMethods 
} from '@/services/azora-pricing/pricing-engine';
import { CURRENCIES } from '@/services/azora-pricing/currency-converter';

interface PricingData {
  tier: string;
  country: string;
  currency: string;
  prices: {
    student: {
      monthly: number;
      yearly: number;
      monthlyFormatted: string;
      yearlyFormatted: string;
    };
    professional: {
      monthly: number;
      yearly: number;
      monthlyFormatted: string;
      yearlyFormatted: string;
    };
  };
  heroText: {
    headline: string;
    subheadline: string;
  };
  paymentMethods: string[];
  learnToEarn: boolean;
}

export default function PricingDisplay() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPricing() {
      try {
        const data = await getPricingForUser();
        
        const currencyInfo = CURRENCIES[data.currency.code] || {
          code: data.currency.code,
          symbol: data.currency.symbol
        };
        
        const pricingData: PricingData = {
          tier: data.tier.tier,
          country: data.location.country,
          currency: data.currency.code,
          prices: {
            student: {
              monthly: data.localizedPricing.student.monthly,
              yearly: data.localizedPricing.student.yearly,
              monthlyFormatted: formatPrice(
                data.localizedPricing.student.monthly,
                data.currency
              ),
              yearlyFormatted: formatPrice(
                data.localizedPricing.student.yearly,
                data.currency
              )
            },
            professional: {
              monthly: data.localizedPricing.professional.monthly,
              yearly: data.localizedPricing.professional.yearly,
              monthlyFormatted: formatPrice(
                data.localizedPricing.professional.monthly,
                data.currency
              ),
              yearlyFormatted: formatPrice(
                data.localizedPricing.professional.yearly,
                data.currency
              )
            }
          },
          heroText: getHeroText(data.tier, data.currency),
          paymentMethods: getPaymentMethods(data.location.countryCode),
          learnToEarn: data.tier.tier === 'TIER_3' || data.tier.tier === 'TIER_4'
        };
        
        setPricing(pricingData);
      } catch (error) {
        console.error('Failed to load pricing:', error);
        // Fallback to USD pricing
      } finally {
        setLoading(false);
      }
    }

    loadPricing();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="text-center p-12">
        <p className="text-red-500">Unable to load pricing. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {pricing.heroText.headline}
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          {pricing.heroText.subheadline}
        </p>
        <div className="mt-4 text-sm text-gray-400">
          Showing prices for: <span className="font-semibold text-cyan-400">{pricing.country}</span> ({pricing.currency})
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Student Plan */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
          <div className="text-sm font-semibold text-cyan-400 mb-2">STUDENT PLAN</div>
          <div className="text-4xl font-bold mb-2">
            {pricing.prices.student.monthlyFormatted}
            <span className="text-lg text-gray-400">/month</span>
          </div>
          {pricing.prices.student.yearly > 0 && (
            <div className="text-sm text-gray-400 mb-6">
              or {pricing.prices.student.yearlyFormatted}/year (save 2 months!)
            </div>
          )}
          
          {pricing.learnToEarn && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="text-green-400 font-semibold mb-2">💰 Learn-to-Earn</div>
              <div className="text-sm text-gray-300">
                Earn while you learn! Active students can earn back 50-100% of tuition through our Learn-to-Earn program.
              </div>
            </div>
          )}
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Access to all 20 Azora institutions
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Unlimited courses
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              AI tutoring & personalized learning
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Digital certificates
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Job board access
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all">
            Get Started
          </button>
        </div>

        {/* Professional Plan */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-8 border-2 border-cyan-500 relative hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            POPULAR
          </div>
          <div className="text-sm font-semibold text-cyan-400 mb-2">PROFESSIONAL PLAN</div>
          <div className="text-4xl font-bold mb-2">
            {pricing.prices.professional.monthlyFormatted}
            <span className="text-lg text-gray-400">/month</span>
          </div>
          <div className="text-sm text-gray-400 mb-6">
            or {pricing.prices.professional.yearlyFormatted}/year (save 2 months!)
          </div>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Everything in Student plan
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Professional certifications
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Advanced AI features
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority support
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Career advancement tools
            </div>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Networking events
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/50">
            Get Started
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold mb-4">Accepted Payment Methods</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {pricing.paymentMethods.map((method) => (
            <div 
              key={method}
              className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-sm"
            >
              {method}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
