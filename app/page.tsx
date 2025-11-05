/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  Globe,
  GraduationCap,
  Shield,
  Code,
  Rocket,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const services = [
    {
      name: 'Azora Sapiens',
      description: 'Advanced education and learning platform',
      href: '/sapiens',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Azora Nexus',
      description: 'AI-powered recommendations and insights',
      href: '/nexus',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Azora Forge',
      description: 'Marketplace and creation platform',
      href: '/forge',
      icon: Code,
      color: 'from-orange-500 to-red-500',
    },
    {
      name: 'Azora Mint',
      description: 'Financial services and currency',
      href: '/mint',
      icon: Rocket,
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Azora Aegis',
      description: 'Security and compliance framework',
      href: '/aegis',
      icon: Shield,
      color: 'from-gray-500 to-slate-500',
    },
  ];

  const features = [
    {
      title: 'AI Integration',
      description: 'Seamless fusion of human intelligence and artificial intelligence',
      icon: Zap,
    },
    {
      title: 'Continuous Learning',
      description: 'Access to comprehensive knowledge through our education platform',
      icon: GraduationCap,
    },
    {
      title: 'Global Connectivity',
      description: 'Connect with users worldwide in real-time',
      icon: Globe,
    },
    {
      title: 'Security First',
      description: 'Enterprise-grade security and compliance',
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <header className="container-safe section-padding" role="banner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 mb-16"
        >
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Next-Generation Operating System
          </Badge>
          <h1 className="heading-1">
            <span className="gradient-text">
              Azora OS
            </span>
          </h1>
          <p className="body-large text-muted-foreground max-w-3xl mx-auto">
            A living, evolving operating system powered by Constitutional AI,
            serving humanity with ethical technology and continuous innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" asChild className="group">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">
                Learn More
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Services Grid */}
        <section className="section-padding-sm" aria-labelledby="services-heading">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grid-auto-fit">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full group">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" asChild className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Link href={service.href}>
                          Explore
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      </header>

      {/* Features Section */}
      <section className="container-safe section-padding" aria-labelledby="features-heading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="features-heading" className="heading-2 mb-4">
            Why Choose Azora OS?
          </h2>
          <p className="body-base text-muted-foreground">
            Built for the future, designed for today
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 grid-auto-fit">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              >
                <Card className="h-full text-center group">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="text-lg justify-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="body-small leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-safe section-padding" aria-labelledby="cta-heading">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 group">
            <CardHeader>
              <CardTitle className="heading-3">
                Ready to get started?
              </CardTitle>
              <CardDescription className="body-large">
                Join thousands of users already using Azora OS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" asChild className="group-hover:scale-105 transition-transform">
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
