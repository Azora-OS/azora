import { Navbar } from "@/components/features/navbar"
import { Footer } from "@/components/features/footer"
import { AetherBackground } from "@/components/ui/aether-background"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Building2, Users, Zap } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out BuildSpaces",
    features: [
      "1 active project",
      "Code Chamber access",
      "Basic AI assistance",
      "Community support",
      "5 agent requests/day",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professional developers",
    features: [
      "Unlimited projects",
      "All 7 Rooms access",
      "Full AI agent team",
      "Priority support",
      "Unlimited agent requests",
      "Custom agents",
      "Team collaboration (up to 5)",
      "Git integration",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "per user/month",
    description: "For growing teams",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Admin dashboard",
      "SSO & SAML",
      "Audit logs",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false,
  },
]

const enterpriseFeatures = [
  { icon: Building2, title: "On-Premise", desc: "Deploy in your own infrastructure" },
  { icon: Users, title: "Unlimited Users", desc: "Scale without per-seat pricing" },
  { icon: Zap, title: "Custom AI Models", desc: "Use your own fine-tuned models" },
  { icon: Sparkles, title: "White Label", desc: "Brand it as your own" },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <AetherBackground intensity="medium" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Simple, transparent</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                pricing
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${plan.popular ? "bg-gradient-to-b from-emerald-500/20 to-transparent border-2 border-emerald-500/50" : "bg-white/5 border border-white/10"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-emerald-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.popular ? "bg-emerald-500 hover:bg-emerald-600" : "bg-transparent border-white/20 hover:bg-white/5"}`}
                    variant={plan.ctaVariant}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Enterprise</h2>
                  <p className="text-gray-400 mb-6">
                    Custom solutions for large organizations. On-premise deployment, dedicated support, and unlimited
                    scale.
                  </p>
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {enterpriseFeatures.map((feature) => (
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

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

            <div className="space-y-6">
              {[
                {
                  q: "Can I switch plans anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                },
                {
                  q: "What happens when I hit my agent request limit?",
                  a: "On the free plan, you'll need to wait until the next day. Pro and Team plans have unlimited requests.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 14-day money-back guarantee on all paid plans. No questions asked.",
                },
                {
                  q: "Can I use my own AI models?",
                  a: "Enterprise customers can integrate custom AI models. Contact our sales team to learn more.",
                },
                {
                  q: "Is my code secure?",
                  a: "Absolutely. All code is encrypted at rest and in transit. We never train AI models on your code without explicit consent.",
                },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
