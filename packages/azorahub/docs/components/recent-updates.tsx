/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import React from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, useTheme } from '@mui/material';
import { NewReleases, Security, Speed, Code } from '@mui/icons-material';

const updates = [
  {
    version: 'v4.0.0',
    title: 'Sovereign Integration Complete',
    date: 'November 4, 2025',
    type: 'major',
    icon: NewReleases,
    features: [
      'W3C DID Core decentralized identity',
      'CRDT real-time collaboration',
      'GraphQL sovereign data layer',
      'WebAssembly edge compute foundation',
    ],
  },
  {
    version: 'v3.5.0',
    title: 'Enterprise Integration Hub',
    date: 'November 3, 2025',
    type: 'feature',
    icon: Code,
    features: [
      'Azure DevOps integration',
      'Microsoft 365 connectivity',
      'GitHub, Jira, Slack, Teams support',
      'Enterprise security & compliance',
    ],
  },
  {
    version: 'v3.0.0',
    title: 'AI-Powered Development Tools',
    date: 'November 2, 2025',
    type: 'feature',
    icon: Speed,
    features: [
      'Intelligent code completion',
      'Natural language to code',
      'Security vulnerability scanning',
      'Performance optimization',
    ],
  },
  {
    version: 'v2.5.0',
    title: 'Fluent Design Integration',
    date: 'November 1, 2025',
    type: 'enhancement',
    icon: Security,
    features: [
      'Microsoft Fluent UI components',
      'Material Design 3 hybrid',
      'WCAG 2.1 AAA accessibility',
      'Cross-platform workspace',
    ],
  },
];

const typeColors = {
  major: '#F25022',
  feature: '#7FBA00',
  enhancement: '#00A4EF',
  bugfix: '#FFB900',
};

export function RecentUpdates() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: 12,
        background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            Recent Updates
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Latest innovations and improvements
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          {updates.map((update, index) => {
            const Icon = update.icon;
            return (
              <Card
                key={index}
                sx={{
                  mb: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${typeColors[update.type as keyof typeof typeColors]}20 0%, ${typeColors[update.type as keyof typeof typeColors]}40 100%)`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 28,
                          color: typeColors[update.type as keyof typeof typeColors],
                        }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                          {update.title}
                        </Typography>
                        <Chip
                          label={update.version}
                          size="small"
                          sx={{
                            bgcolor: typeColors[update.type as keyof typeof typeColors],
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={update.type.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {update.date}
                      </Typography>

                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {update.features.map((feature, idx) => (
                          <Typography
                            component="li"
                            key={idx}
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            {feature}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default RecentUpdates;

