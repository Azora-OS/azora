"use client"

import { motion } from "framer-motion"
import { Check, Sparkles, Zap, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for learning and personal projects",
    icon: Sparkles,
    features: [
      "5 workspaces",
      "1,000 AI generations/month",
      "Community support",
      "Public repositories only",
      "Basic integrations",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professional developers and teams",
    icon: Zap,
    features: [
      "Unlimited workspaces",
      "50,000 AI generations/month",
      "Priority support",
      "Private repositories",
      "All integrations",
      "Custom AI agents",
      "Git sync & deployment",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    icon: Building,
    features: [
      "Everything in Pro",
      "Unlimited AI generations",
      "24/7 dedicated support",
      "SSO & SAML",
      "Custom contracts",
      "On-premise deployment",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden bg-muted/30">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Pricing</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Simple pricing,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              powerful results
            </span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Start for free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted ? "border-primary bg-card shadow-xl shadow-primary/10" : "border-border bg-card/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlighted ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <plan.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>

              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check
                      className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
