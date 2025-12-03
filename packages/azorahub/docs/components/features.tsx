/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, useTheme } from '@mui/material';
import {
  Security,
  Speed,
  Cloud,
  Code,
  AutoAwesome,
  Verified,
  Language,
  IntegrationInstructions,
} from '@mui/icons-material';

const features = [
  {
    icon: Security,
    title: 'Sovereign Identity',
    description: 'W3C DID Core compliant decentralized identity with cryptographic user control',
    color: '#0078D4',
  },
  {
    icon: Cloud,
    title: 'CRDT Collaboration',
    description: 'True peer-to-peer synchronization with conflict-free replication',
    color: '#00A4EF',
  },
  {
    icon: Code,
    title: 'GraphQL Data Layer',
    description: 'Client-controlled data fetching with type-safe schema and real-time subscriptions',
    color: '#7FBA00',
  },
  {
    icon: AutoAwesome,
    title: 'AI-Powered Tools',
    description: 'Intelligent code completion, generation, and security scanning',
    color: '#FFB900',
  },
  {
    icon: IntegrationInstructions,
    title: 'Enterprise Integration',
    description: 'Azure DevOps, Microsoft 365, GitHub, Jira, Slack, and Teams integration',
    color: '#F25022',
  },
  {
    icon: Verified,
    title: 'Constitutional AI',
    description: 'Transparent governance with OPA policy engine and ethical AI enforcement',
    color: '#6750A4',
  },
  {
    icon: Speed,
    title: 'Edge Compute',
    description: 'WebAssembly for native performance across all platforms',
    color: '#00B4D8',
  },
  {
    icon: Language,
    title: 'Universal Platform',
    description: 'Works seamlessly on Web, Desktop, Mobile, and CLI',
    color: '#9D4EDD',
  },
];

export function Features() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: 12,
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Revolutionary Features
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            The world's first Sovereign AI Ecosystem with complete control over identity, data, and compute
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}40 100%)`,
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: feature.color }} />
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

export default Features;

