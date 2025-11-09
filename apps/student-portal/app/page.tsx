export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <img src="/branding/logo-primary.svg" alt="Azora" className="h-20 mx-auto mb-8" />
        <h1 className="text-6xl font-bold mb-6">Learn. Earn. Prosper.</h1>
        <p className="text-2xl text-gray-600 mb-8">
          The World's First Constitutional AI Operating System
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl hover:bg-blue-700">
            Get Started Free
          </a>
          <a href="/login" className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-xl hover:bg-blue-50">
            Login
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold mb-2">Learn</h3>
          <p className="text-gray-600">20 institutions, K-12 to PhD</p>
        </div>
        <div className="text-center p-6">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-2xl font-bold mb-2">Earn</h3>
          <p className="text-gray-600">Get paid while you study</p>
        </div>
        <div className="text-center p-6">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">Prosper</h3>
          <p className="text-gray-600">Graduate with savings</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold">190M+</div>
            <div className="text-blue-200">Student Capacity</div>
          </div>
          <div>
            <div className="text-4xl font-bold">20</div>
            <div className="text-blue-200">Institutions</div>
          </div>
          <div>
            <div className="text-4xl font-bold">15%</div>
            <div className="text-blue-200">APY Staking</div>
          </div>
          <div>
            <div className="text-4xl font-bold">0.1%</div>
            <div className="text-blue-200">Transaction Fee</div>
          </div>
        </div>
      </section>
    </div>
  );
}