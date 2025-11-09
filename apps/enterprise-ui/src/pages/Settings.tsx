import React from 'react';
import { ApiSettingsPage } from '../../../../packages/components/ApiSettings';

export function Settings() {
  const services = [
    {
      name: 'analytics',
      displayName: 'Analytics Service',
      description: 'Provides business intelligence and reporting data',
      defaultUrl: 'http://localhost:6000'
    },
    {
      name: 'enterprise',
      displayName: 'Enterprise Service',
      description: 'Manages enterprise features and user management',
      defaultUrl: 'http://localhost:6001'
    },
    {
      name: 'reporting',
      displayName: 'Reporting Service',
      description: 'Generates detailed reports and analytics',
      defaultUrl: 'http://localhost:6002'
    }
  ];

  return (
    <ApiSettingsPage
      appName="Azora Enterprise UI"
      services={services}
    />
  );
}