/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

export const getServiceBrand = (servicePath: string) => {
  // In a real app, this would fetch from a config service
  // For now, we mock it based on the path
  switch (servicePath) {
    case 'education':
      return {
        name: 'Azora Education',
        tagline: 'The Future of Learning',
        logo: '/branding/services/azora-education-logo.svg',
        colors: {
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          accent: '#a78bfa',
          gradient: 'from-purple-600 via-violet-600 to-indigo-600',
        },
      };
    default:
      return {
        name: 'Azora OS',
        tagline: 'The Operating System for a New Generation',
        logo: '/branding/logo-primary.svg',
        colors: {
          primary: '#3b82f6',
          secondary: '#2563eb',
          accent: '#60a5fa',
          gradient: 'from-blue-600 via-sky-600 to-cyan-600',
        },
      };
  }
};
