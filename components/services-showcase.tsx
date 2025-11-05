/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { motion } from 'framer-motion';
import { Logo } from './logo';
import { SERVICES, getCategories } from '@/lib/assets';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Services Showcase Component
 * Displays all Azora OS services with premium logos
 */
export function ServicesShowcase() {
  const categories = getCategories();

  return (
    <div className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Our Ecosystem
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A comprehensive suite of sovereign, powerful services
          </p>
        </motion.div>

        {categories.map((category, categoryIdx) => {
          const categoryServices = SERVICES.filter((s) => s.category === category);

          return (
            <div key={category} className="mb-16">
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: categoryIdx * 0.1 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-white mb-8 pl-4 border-l-4 border-purple-500"
              >
                {category}
              </motion.h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryServices.map((service, serviceIdx) => (
                  <motion.div
                    key={service.shortName}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: (categoryIdx * 0.1) + (serviceIdx * 0.05),
                    }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                      style={{
                        background: `linear-gradient(135deg, ${service.color}, ${service.accent})`,
                      }}
                    />
                    
                    <div className="relative p-6 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 transition-all duration-300 h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <Logo
                          service={service.shortName}
                          style="geometric"
                          size="medium"
                          width={80}
                          height={80}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-1">
                            {service.name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {service.tagline}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4 flex-1 text-sm">
                        {service.description}
                      </p>
                      
                      <Link
                        href={`/services/${service.shortName}`}
                        className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-2 text-sm font-semibold"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


