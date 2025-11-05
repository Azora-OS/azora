/**
 * PRICING PAGE
 * 
 * Public-facing pricing page with dynamic geo-based pricing
 */

import PricingDisplay from '@/components/PricingDisplay';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-2xl font-bold">Azora</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="hover:text-cyan-400 transition">Home</a>
            <a href="/about" className="hover:text-cyan-400 transition">About</a>
            <a href="/pricing" className="text-cyan-400">Pricing</a>
            <a href="/contact" className="hover:text-cyan-400 transition">Contact</a>
          </nav>
          <div className="flex space-x-4">
            <a 
              href="/login" 
              className="px-4 py-2 hover:text-cyan-400 transition"
            >
              Sign In
            </a>
            <a 
              href="/signup" 
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <PricingDisplay />
        
        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Why are prices different by country?</h3>
              <p className="text-gray-300">
                We use Purchasing Power Parity (PPP) to ensure fair pricing globally. 
                Education should be accessible to everyone, regardless of where they live.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">What is Learn-to-Earn?</h3>
              <p className="text-gray-300">
                Students earn cryptocurrency by completing lessons, assignments, and courses. 
                Active learners can earn $10-$30/month, offsetting tuition costs.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Can I switch plans?</h3>
              <p className="text-gray-300">
                Yes! You can upgrade or downgrade at any time. Changes take effect at the start 
                of your next billing cycle.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-300">
                We accept cards, PayPal, crypto, and local payment methods like M-Pesa, UPI, PIX, 
                and mobile money depending on your country.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Is it really FREE for African students?</h3>
              <p className="text-gray-300">
                Yes! Students from most African countries get 100% FREE access to all courses, 
                certifications, and platforms. No hidden fees, ever.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Do you offer refunds?</h3>
              <p className="text-gray-300">
                We offer a 14-day money-back guarantee. If you're not satisfied, 
                we'll refund your payment, no questions asked.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students worldwide. Start your journey today.
            </p>
            <a 
              href="/signup" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-600 transition shadow-lg shadow-cyan-500/50"
            >
              Get Started Now →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-cyan-400">Features</a></li>
                <li><a href="/pricing" className="hover:text-cyan-400">Pricing</a></li>
                <li><a href="/roadmap" className="hover:text-cyan-400">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-cyan-400">About</a></li>
                <li><a href="/careers" className="hover:text-cyan-400">Careers</a></li>
                <li><a href="/contact" className="hover:text-cyan-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/docs" className="hover:text-cyan-400">Documentation</a></li>
                <li><a href="/blog" className="hover:text-cyan-400">Blog</a></li>
                <li><a href="/support" className="hover:text-cyan-400">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-cyan-400">Privacy</a></li>
                <li><a href="/terms" className="hover:text-cyan-400">Terms</a></li>
                <li><a href="/security" className="hover:text-cyan-400">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 Azora OS. Building the future of education, finance, and technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
