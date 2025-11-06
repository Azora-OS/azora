/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowForward,
  AutoAwesome,
  Speed,
  Code,
  MenuBook,
  PlayArrow,
  GitHub,
} from '@mui/icons-material';

export { Hero };
export default function Hero() {
  const theme = useTheme();
  const [currentWord, setCurrentWord] = useState(0);
  const [mounted, setMounted] = useState(false);
  const words = ['Living', 'Intelligent', 'Adaptive', 'Evolutionary'];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Speed,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant search and navigation',
    },
    {
      icon: Code,
      title: 'Developer First',
      description: 'Built by developers, for developers',
    },
    {
      icon: MenuBook,
      title: 'Comprehensive',
      description: 'Complete coverage of all Azorahub features',
    },
    {
      icon: AutoAwesome,
      title: 'AI Powered',
      description: 'Smart content generation and recommendations',
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 50%, ${alpha(theme.palette.tertiary?.main || '#7D5260', 0.05)} 100%)`,
        py: { xs: 8, md: 12 },
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px), linear-gradient(to bottom, ${alpha(theme.palette.divider, 0.1)} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          opacity: 0.5,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={mounted} timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Version Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Chip
                icon={<AutoAwesome />}
                label="Version 1.0 - Now Available"
                color="primary"
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '& .MuiChip-icon': {
                    color: 'primary.main',
                  },
                }}
              />
            </Box>

            {/* Main Heading */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                fontWeight: 400,
                lineHeight: 1.1,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Azorahub Documentation
              <br />
              <Typography
                component="span"
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  transition: 'all 0.5s ease-in-out',
                }}
              >
                The {words[currentWord]} OS
              </Typography>
            </Typography>

            {/* Description */}
            <Typography
              variant="h5"
              component="p"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                mb: 6,
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
              }}
            >
              Comprehensive documentation for Azorahub - an intelligent, adaptive operating system 
              that evolves with your needs. Build, deploy, and scale with confidence.
            </Typography>

            {/* CTA Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 6,
              }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                component="a"
                href="/getting-started"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Code />}
                component="a"
                href="/api"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                API Reference
              </Button>
            </Box>

            {/* Secondary Actions */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                fontSize: '0.875rem',
                color: 'text.secondary',
              }}
            >
              <Button
                variant="text"
                startIcon={<MenuBook />}
                component="a"
                href="/tutorials"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                View Tutorials
              </Button>
              <Button
                variant="text"
                startIcon={<GitHub />}
                component="a"
                href="https://github.com/azorahub"
                target="_blank"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                GitHub
              </Button>
              <Button
                variant="text"
                startIcon={<PlayArrow />}
                component="a"
                href="https://discord.azorahub.com"
                target="_blank"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                Live Demo
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Feature Cards */}
        <Slide in={mounted} direction="up" timeout={1000}>
          <Grid container spacing={3} sx={{ mt: 8 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={feature.title}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backgroundColor: 'background.paper',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }}
                      >
                        <Icon sx={{ fontSize: 28, color: 'white' }} />
                      </Avatar>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: 'text.primary',
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="p"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Slide>
      </Container>
    </Box>
  );
}

