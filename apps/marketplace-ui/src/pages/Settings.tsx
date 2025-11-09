import React from 'react';
import { ApiSettingsPage } from '../../../../packages/components/ApiSettings';

export function Settings() {
  const services = [
    {
      name: 'marketplace',
      displayName: 'Marketplace Service',
      description: 'Handles product listings, orders, and marketplace operations',
      defaultUrl: 'http://localhost:5000'
    },
    {
      name: 'payment',
      displayName: 'Payment Service',
      description: 'Processes payments and manages transactions',
      defaultUrl: 'http://localhost:3002'
    },
    {
      name: 'inventory',
      displayName: 'Inventory Service',
      description: 'Manages product stock and availability',
      defaultUrl: 'http://localhost:5001'
    }
  ];

  return (
    <ApiSettingsPage
      appName="Azora Marketplace UI"
      services={services}
    />
  );
}