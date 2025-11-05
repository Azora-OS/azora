/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import {
  GitHub,
  Twitter,
  Forum,
  Email,
  Article,
  VideoLibrary,
} from '@mui/icons-material';

const communityLinks = [
  {
    icon: GitHub,
    title: 'GitHub',
    description: 'Contribute to the codebase, report issues, and collaborate',
    link: 'https://github.com/Azora-OS-AI/azora-os',
    color: '#6750A4',
  },
  {
    icon: Twitter,
    title: 'Twitter',
    description: 'Follow us for updates, announcements, and community highlights',
    link: 'https://twitter.com/AzoraOS',
    color: '#1DA1F2',
  },
  {
    icon: Forum,
    title: 'Discord',
    description: 'Join our community for real-time discussions and support',
    link: 'https://discord.gg/azora',
    color: '#5865F2',
  },
  {
    icon: Article,
    title: 'Blog',
    description: 'Read about our latest innovations, tutorials, and insights',
    link: 'https://azora-os.vercel.app/blog',
    color: '#FF6B6B',
  },
  {
    icon: VideoLibrary,
    title: 'YouTube',
    description: 'Watch tutorials, demos, and community showcases',
    link: 'https://youtube.com/@AzoraOS',
    color: '#FF0000',
  },
  {
    icon: Email,
    title: 'Newsletter',
    description: 'Subscribe for monthly updates and exclusive content',
    link: 'https://azora-os.vercel.app/newsletter',
    color: '#00B4D8',
  },
];

export function Community() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: 12,
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}10 100%)`,
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
            Join the Community
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Be part of the sovereign AI revolution. Connect, contribute, and grow with us.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {communityLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        background: `linear-gradient(135deg, ${link.color}20 0%, ${link.color}40 100%)`,
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color: link.color }} />
                    </Box>

                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {link.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, flexGrow: 1 }}
                    >
                      {link.description}
                    </Typography>

                    <Button
                      variant="outlined"
                      fullWidth
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: link.color,
                        color: link.color,
                        '&:hover': {
                          borderColor: link.color,
                          bgcolor: `${link.color}10`,
                        },
                      }}
                    >
                      Visit
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Deploy Azora OS today and experience the future of sovereign computing
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              href="https://github.com/Azora-OS-AI/azora-os"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHub />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              View on GitHub
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="https://azora-os.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Live Demo
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Community;

