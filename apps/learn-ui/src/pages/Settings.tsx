import React from 'react';
import { ApiSettingsPage } from '../../../../packages/components/ApiSettings';

export function Settings() {
  const services = [
    {
      name: 'lms',
      displayName: 'Learning Management System',
      description: 'Handles course content, enrollment, and progress tracking',
      defaultUrl: 'http://localhost:4500'
    },
    {
      name: 'course',
      displayName: 'Course Service',
      description: 'Manages course catalog and content delivery',
      defaultUrl: 'http://localhost:4501'
    },
    {
      name: 'analytics',
      displayName: 'Analytics Service',
      description: 'Tracks learning progress and generates insights',
      defaultUrl: 'http://localhost:4502'
    }
  ];

  return (
    <ApiSettingsPage
      appName="Azora Learn UI"
      services={services}
    />
  );
}