/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper, useTheme } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

const installCommands = {
  npm: `# Clone the sovereign ecosystem
git clone https://github.com/Azora-OS-AI/azora-os.git
cd azora-os

# Install dependencies
npm install

# Launch development server
npm run dev`,
  docker: `# Build Docker image
docker build -t azora-os .

# Run container
docker run -p 3000:3000 azora-os

# Or use Docker Compose
docker-compose up -d`,
  vercel: `# One-click deploy
# Click the button above or use Vercel CLI
vercel deploy`,
};

export function QuickStart() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const commands = Object.values(installCommands)[activeTab];
    navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box component="section" sx={{ py: 12 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
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
            Quick Start
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Get started with Azora OS in minutes
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            maxWidth: 800,
            mx: 'auto',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            }}
          >
            <Tab label="NPM" />
            <Tab label="Docker" />
            <Tab label="Vercel" />
          </Tabs>

          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                p: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}
            >
              {Object.values(installCommands)[activeTab]}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                },
              }}
              onClick={handleCopy}
            >
              {copied ? (
                <Check sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <ContentCopy sx={{ fontSize: 20 }} />
              )}
            </Box>
          </Box>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Open your browser at{' '}
            <Typography
              component="span"
              sx={{
                fontFamily: 'monospace',
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            >
              http://localhost:3000
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default QuickStart;

