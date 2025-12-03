/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  GitHub,
  Launch,
  BookOpen,
  Code,
  Users,
  Shield,
  Brightness4,
  Brightness7,
  AccountCircle,
  Settings,
  Logout,
} from '@mui/icons-material';
import { CommandMenu } from '@/components/command-menu';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
  { name: 'Getting Started', href: '/getting-started', icon: BookOpen },
  { name: 'API Reference', href: '/api', icon: Code },
  { name: 'Guides', href: '/guides', icon: BookOpen },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Security', href: '/security', icon: Shield },
];

export function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Azorahub
        </Typography>
        <IconButton onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem
              key={item.name}
              component={Link}
              href={item.href}
              onClick={() => setIsOpen(false)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ px: 2, py: 1 }}>
        <CommandMenu />
        <ThemeToggle />
        <Button
          variant="outlined"
          fullWidth
          startIcon={<GitHub />}
          component="a"
          href="https://github.com/azorahub"
          target="_blank"
          sx={{ mt: 1 }}
        >
          GitHub
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={scrolled ? 4 : 0}
        sx={{
          backgroundColor: scrolled ? 'background.paper' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.3s ease-in-out',
          borderBottom: scrolled ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #6750A4 0%, #D0BCFF 100%)',
                }}
              >
                A
              </Avatar>
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Azorahub
              </Typography>
            </Link>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    component={Link}
                    href={item.href}
                    startIcon={<Icon sx={{ fontSize: 18 }} />}
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        color: 'text.primary',
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommandMenu />
            <ThemeToggle />
            
            {!isMobile && (
              <>
                <Chip
                  label="v1.0.0"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<GitHub />}
                  component="a"
                  href="https://github.com/azorahub"
                  target="_blank"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  GitHub
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                onClick={() => setIsOpen(true)}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

