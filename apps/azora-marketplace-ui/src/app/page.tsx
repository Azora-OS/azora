import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-ubuntu-sapphire mb-4">
            Azora Marketplace Ui
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ubuntu Constitutional AI Interface
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-ubuntu-emerald mb-4">
              Ubuntu Philosophy
            </h2>
            <p className="text-lg italic text-gray-700">
              "Ngiyakwazi ngoba sikwazi - I am because we are"
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-sm text-gray-600">
                • My success enables your success
              </div>
              <div className="text-sm text-gray-600">
                • My knowledge becomes our knowledge
              </div>
              <div className="text-sm text-gray-600">
                • My work strengthens our foundation
              </div>
              <div className="text-sm text-gray-600">
                • My security ensures our freedom
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}