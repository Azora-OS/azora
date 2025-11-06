/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 👑 AZORA OS - SERVICES DIRECTORY
 *
 * Divine services directory showcasing all offerings
 */

'use client';

import { DivineThrone } from '@/components/divine/DivineThrone';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { Logo } from '@/components/logo';
import { OrganicButton } from '@/components/organism/OrganicButton';
import { Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const services = [
    {
      name: 'Azora Sapiens',
      description:
        'Universal education platform with divine wisdom. Learn anything, become anyone.',
      href: '/sapiens',
      variant: 'divine' as const,
      color: '#FFD700',
      category: 'Education',
      logo: 'sapiens',
    },
    {
      name: 'Azora Nexus',
      description:
        'True AGI that thinks, learns, and evolves. Your divine companion.',
      href: '/nexus',
      variant: 'cosmic' as const,
      color: '#87CEEB',
      category: 'AI',
      logo: 'nexus',
    },
    {
      name: 'Azora Forge',
      description:
        'Create anything imaginable with AI-powered development tools.',
      href: '/forge',
      variant: 'crystal' as const,
      color: '#9400D3',
      category: 'Development',
      logo: 'forge',
    },
    {
      name: 'Azora Aegis',
      description:
        'Divine security and protection that watches over your digital life.',
      href: '/aegis',
      variant: 'glass' as const,
      color: '#C0C0C0',
      category: 'Security',
      logo: 'aegis',
    },
    {
      name: 'Azora Unity',
      description: 'Connect every human on Earth in harmony and understanding.',
      href: '/unity',
      variant: 'holographic' as const,
      color: '#FF69B4',
      category: 'Social',
      logo: 'azora-os',
    },
    {
      name: 'Azora Marketplace',
      description:
        'Global skills marketplace where knowledge becomes prosperity.',
      href: '/marketplace',
      variant: 'iridescent' as const,
      color: '#00CED1',
      category: 'Marketplace',
      logo: 'forge',
    },
    {
      name: 'Azora Covenant',
      description:
        'Divine governance and decision-making platform for humanity.',
      href: '/covenant',
      variant: 'divine' as const,
      color: '#FFA500',
      category: 'Governance',
      logo: 'covenant',
    },
    {
      name: 'Azora Mint',
      description: 'Universal digital currency and economic system.',
      href: '/mint',
      variant: 'crystal' as const,
      color: '#FFD700',
      category: 'Finance',
      logo: 'mint',
    },
  ];

  const filteredServices = services.filter(
    service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(
    new Set(services.map(service => service.category))
  );

  return (
    <DivineThrone
      title="DIVINE SERVICES"
      subtitle="Explore the Kingdom's Offerings"
      showParticles={true}
      showSacredGeometry={true}
    >
      {/* Search and Filter Section */}
      <div className="mb-12">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search divine services..."
              className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-[#FFD700]/30 backdrop-blur-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Zap className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#FFD700]" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <OrganicButton
            variant="divine"
            size="sm"
            className="px-6 py-2"
            onClick={() => setSearchTerm('')}
          >
            All Services
          </OrganicButton>
          {categories.map((category, index) => (
            <OrganicButton
              key={index}
              variant="consciousness"
              size="sm"
              className="px-6 py-2"
              onClick={() => setSearchTerm(category)}
            >
              {category}
            </OrganicButton>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-20">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text">
          Divine Services Directory
        </h2>
        <p className="text-center text-white/70 text-lg mb-12 max-w-3xl mx-auto">
          Each service is crafted with divine precision to serve humanity's
          highest potential
        </p>

        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              No Services Found
            </h3>
            <p className="text-white/70 mb-6">
              Try adjusting your search terms
            </p>
            <OrganicButton
              variant="divine"
              size="md"
              className="px-8 py-3"
              onClick={() => setSearchTerm('')}
            >
              View All Services
            </OrganicButton>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredServices.map((service, index) => {
              return (
                <Link key={index} href={service.href}>
                  <Immersive3DCard
                    variant={service.variant}
                    depth="extreme"
                    float={true}
                    tilt={true}
                    glow={true}
                    className="h-full cursor-pointer group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="p-3 rounded-xl flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${service.color}40, ${service.color}20)`,
                          boxShadow: `0 0 20px ${service.color}60`,
                        }}
                      >
                        {/* Official Service Logo */}
                        <div className="w-8 h-8">
                          <Logo
                            service={service.logo}
                            style="geometric"
                            size="icon"
                            width={32}
                            height={32}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors">
                          {service.name}
                        </h3>
                        <span
                          className="inline-block mt-1 px-2 py-1 text-xs rounded-full"
                          style={{
                            background: `${service.color}20`,
                            color: service.color,
                            border: `1px solid ${service.color}40`,
                          }}
                        >
                          {service.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/80 text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-2 text-[#FFD700] font-bold text-sm">
                      <span>Enter Service</span>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                  </Immersive3DCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center pb-12">
        <Immersive3DCard
          variant="divine"
          depth="infinite"
          float={true}
          tilt={true}
          glow={true}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#87CEEB] text-transparent bg-clip-text">
            Ready to Begin Your Divine Journey?
          </h3>
          <p className="text-lg text-white/90 leading-relaxed text-center mb-8 max-w-2xl mx-auto">
            Step into a world where technology serves humanity and AI enlightens
            rather than replaces.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/kingdom">
              <OrganicButton
                variant="divine"
                size="lg"
                pulse={true}
                sacred={true}
                className="text-lg px-8 py-4"
              >
                <Crown className="w-6 h-6 mr-2" />
                Enter the Kingdom
              </OrganicButton>
            </Link>

            <Link href="/">
              <OrganicButton
                variant="consciousness"
                size="lg"
                pulse={true}
                className="text-lg px-8 py-4"
              >
                <Zap className="w-6 h-6 mr-2" />
                Return Home
              </OrganicButton>
            </Link>
          </div>
        </Immersive3DCard>
      </div>
    </DivineThrone>
  );
}

