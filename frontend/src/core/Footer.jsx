import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import { Store } from '@mui/icons-material';

const footerLinks = {
  'About Cara': [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Press Releases', to: '/' },
    { label: 'Privacy Policy', to: '/' },
  ],
  'Customer Service': [
    { label: 'Help Center', to: '/' },
    { label: 'Track My Order', to: '/user/dashboard' },
    { label: 'Returns & Exchanges', to: '/' },
    { label: 'Shipping Policy', to: '/' },
  ],
  'Shop': [
    { label: 'All Products', to: '/shop' },
    { label: 'New Arrivals', to: '/' },
    { label: 'Best Sellers', to: '/' },
    { label: 'Deals & Offers', to: '/shop' },
  ],
  'Seller': [
    { label: 'Sell on Cara', to: '/admin/login' },
    { label: 'Seller Dashboard', to: '/admin/dashboard' },
    { label: 'Seller Guidelines', to: '/' },
    { label: 'Seller Support', to: '/' },
  ],
};

const Footer = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: '#131921',
      color: 'rgba(255,255,255,0.85)',
      mt: 'auto',
    }}
  >
    {/* Top strip */}
    <Box sx={{ bgcolor: '#232F3E', py: 1.5 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': { opacity: 0.85 },
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            Back to top
          </Typography>
        </Box>
      </Container>
    </Box>

    {/* Main links grid */}
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
      <Grid container spacing={4}>
        {Object.entries(footerLinks).map(([section, links]) => (
          <Grid key={section} size={{ xs: 6, sm: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 2,
                fontSize: '0.875rem',
              }}
            >
              {section}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {links.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1 }}>
                  <Typography
                    component={Link}
                    to={link.to}
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      '&:hover': { color: '#FF9900', textDecoration: 'underline' },
                      transition: 'color 0.15s ease-in-out',
                    }}
                  >
                    {link.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>

    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

    {/* Bottom bar */}
    <Container maxWidth="lg">
      <Box
        sx={{
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store sx={{ color: '#FF9900', fontSize: 22 }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#ffffff',
              '& span': { color: '#FF9900' },
            }}
          >
            Ca<span>ra</span>
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', flex: 1 }}
        >
          © {new Date().getFullYear()} Cara E-Commerce. All rights reserved.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {['Privacy', 'Terms', 'Cookies'].map((item) => (
            <Typography
              key={item}
              component={Link}
              to="/"
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                '&:hover': { color: 'rgba(255,255,255,0.9)' },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>
    </Container>
  </Box>
);

export default Footer;
