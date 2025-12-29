import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Building2, Users, Zap, Globe, Calculator, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { currencyService, PRICING_TIERS, type PricingTier, type Discount } from '../services/currency-service';

interface SmartPricingProps {
  userProfile?: {
    isStudent?: boolean;
    fundContribution?: number;
    teamSize?: number;
    billingCycle?: 'monthly' | 'annual';
  };
  onPlanSelect?: (tierId: string) => void;
}

interface DisplayPrice {
  original: string;
  discounted: string;
  savings: string;
  savingsPercentage: number;
  usdAmount: number;
}

export const SmartPricing: React.FC<SmartPricingProps> = ({
  userProfile = {},
  onPlanSelect
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(currencyService.getUserCurrency());
  const [displayPrices, setDisplayPrices] = useState<Record<string, DisplayPrice>>({});
  const [applicableDiscounts, setApplicableDiscounts] = useState<Discount[]>([]);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  useEffect(() => {
    loadPricing();
  }, [selectedCurrency, userProfile]);

  const loadPricing = async () => {
    const discounts = currencyService.getApplicableDiscounts(userProfile);
    setApplicableDiscounts(discounts);

    const prices: Record<string, DisplayPrice> = {};

    for (const tier of PRICING_TIERS) {
      const finalPriceUSD = currencyService.calculateFinalPrice(
        tier.basePriceUSD,
        discounts,
        userProfile
      );

      const comparison = await currencyService.getPriceComparison(
        tier.basePriceUSD,
        finalPriceUSD
      );

      prices[tier.id] = {
        ...comparison,
        usdAmount: finalPriceUSD
      };
    }

    setDisplayPrices(prices);
  };

  const handleCurrencyChange = (currencyCode: string) => {
    currencyService.setUserCurrency(currencyCode);
    setSelectedCurrency(currencyService.getUserCurrency());
    setShowCurrencySelector(false);
  };

  const getDiscountBadges = () => {
    const badges = [];
    
    if (userProfile.isStudent) {
      badges.push({ text: '50% Student Discount', color: 'bg-blue-500' });
    }
    
    if ((userProfile.fundContribution || 0) >= 100) {
      badges.push({ text: '25% Fund Contributor', color: 'bg-purple-500' });
    }
    
    if (userProfile.billingCycle === 'annual') {
      badges.push({ text: '20% Annual Discount', color: 'bg-green-500' });
    }
    
    if ((userProfile.teamSize || 0) >= 10) {
      badges.push({ text: '15% Volume Discount', color: 'bg-orange-500' });
    }

    return badges;
  };

  const discountBadges = getDiscountBadges();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Currency Selector */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          onClick={() => setShowCurrencySelector(!showCurrencySelector)}
          className="bg-white/10 border-white/20 hover:bg-white/20"
        >
          <Globe className="h-4 w-4 mr-2" />
          {selectedCurrency.symbol} {selectedCurrency.code}
        </Button>

        {showCurrencySelector && (
          <div className="absolute top-12 right-0 bg-[#161b22] border border-white/20 rounded-lg p-2 min-w-[200px]">
            <div className="grid grid-cols-2 gap-1">
              {currencyService.getAvailableCurrencies().map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`p-2 text-left rounded hover:bg-white/10 ${
                    selectedCurrency.code === currency.code ? 'bg-white/20' : ''
                  }`}
                >
                  <div className="font-medium">{currency.symbol} {currency.code}</div>
                  <div className="text-xs text-gray-400">{currency.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Discount Summary */}
      {discountBadges.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg p-4 mx-4 mt-20 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Your Discounts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {discountBadges.map((badge, index) => (
              <span
                key={index}
                className={`${badge.color} text-white text-sm px-3 py-1 rounded-full`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      )}

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Smart pricing for</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                global developers
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start at just $12 USD/month. Automatic currency conversion with local discounts.
            </p>

            {/* Currency Info */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calculator className="h-4 w-4" />
                <span>Auto-converted to {selectedCurrency.name}</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full" />
              <div>
                Student & contributor discounts available
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {PRICING_TIERS.map((tier) => {
                const price = displayPrices[tier.id];
                if (!price) return null;

                return (
                  <div
                    key={tier.id}
                    className={`relative rounded-2xl p-6 ${
                      tier.popular 
                        ? "bg-gradient-to-b from-emerald-500/20 to-transparent border-2 border-emerald-500/50 transform scale-105" 
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-emerald-500 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                      
                      <div className="mb-2">
                        {price.savingsPercentage > 0 ? (
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-emerald-400">
                                {price.discounted}
                              </span>
                              <span className="text-sm text-gray-400">/month</span>
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              {price.original}/month
                            </div>
                            <div className="text-xs text-emerald-400 font-medium">
                              Save {price.savingsPercentage}%
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{price.discounted}</span>
                            <span className="text-gray-400">/month</span>
                          </div>
                        )}
                      </div>

                      {tier.basePriceUSD > 0 && (
                        <div className="text-xs text-gray-500">
                          ≈ ${price.usdAmount.toFixed(2)} USD
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => onPlanSelect?.(tier.id)}
                      className={`w-full ${
                        tier.popular 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-transparent border-white/20 hover:bg-white/5"
                      }`}
                      variant={tier.popular ? "default" : "outline"}
                    >
                      {tier.id === 'free' ? 'Get Started' : 
                       tier.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Discount Details */}
        {applicableDiscounts.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-bold text-center mb-8">Available Discounts</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {applicableDiscounts.map((discount) => (
                  <div key={discount.type} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold">{discount.description}</h3>
                      <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                        {discount.percentage}% OFF
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {discount.type === 'student' && 'Verified students get 50% off all plans'}
                      {discount.type === 'fund_contribution' && 'Community fund contributors get 25% off'}
                      {discount.type === 'annual' && 'Pay annually and save 20%'}
                      {discount.type === 'volume' && 'Teams of 10+ get 15% volume discount'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Enterprise Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Enterprise</h2>
                  <p className="text-gray-400 mb-6">
                    Custom solutions for large organizations. On-premise deployment, dedicated support, and unlimited scale.
                  </p>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    Contact Sales
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Building2, title: "On-Premise", desc: "Deploy in your own infrastructure" },
                    { icon: Users, title: "Unlimited Users", desc: "Scale without per-seat pricing" },
                    { icon: Zap, title: "Custom AI Models", desc: "Use your own fine-tuned models" },
                    { icon: Sparkles, title: "White Label", desc: "Brand it as your own" },
                  ].map((feature) => (
                    <div key={feature.title} className="p-4 rounded-lg bg-white/5">
                      <feature.icon className="h-6 w-6 text-emerald-400 mb-2" />
                      <h4 className="font-medium mb-1">{feature.title}</h4>
                      <p className="text-xs text-gray-400">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SmartPricing;
