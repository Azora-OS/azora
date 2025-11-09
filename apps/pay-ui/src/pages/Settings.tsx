import React from 'react';
import { ApiSettingsPage } from '../../../../packages/components/ApiSettings';

export function Settings() {
  const services = [
    {
      name: 'payment',
      displayName: 'Payment Service',
      description: 'Handles payment processing, transactions, and wallet management',
      defaultUrl: 'http://localhost:3002'
    },
    {
      name: 'compliance',
      displayName: 'Compliance Service',
      description: 'Manages compliance checks, reports, and regulatory requirements',
      defaultUrl: 'http://localhost:4000'
    },
    {
      name: 'mint',
      displayName: 'Mint Service',
      description: 'Handles cryptocurrency minting and token management',
      defaultUrl: 'http://localhost:3003'
    }
  ];

  return (
    <ApiSettingsPage
      appName="Azora Pay UI"
      services={services}
    />
  );
}