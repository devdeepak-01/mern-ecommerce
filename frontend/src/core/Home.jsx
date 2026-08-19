import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Menu from './Menu';
import { getProducts, getCategories } from './apiCore.js';
import Card from './Card.jsx';
import Footer from './Footer.jsx';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  LaptopMac,
  PhoneAndroid,
  Headset,
  Watch,
  Man,
  Woman,
  SportsSoccer,
  Kitchen,
  FaceRetouchingNatural,
  MenuBook,
  Category,
  ChevronRight,
} from '@mui/icons-material';

// Map category names to icons
const CATEGORY_ICONS = {
  Electronics: <LaptopMac />,
  Mobiles: <PhoneAndroid />,
  Laptops: <LaptopMac />,
  Headphones: <Headset />,
  Watches: <Watch />,
  "Men's Fashion": <Man />,
  "Women's Fashion": <Woman />,
  Footwear: <SportsSoccer />,
  'Home & Kitchen': <Kitchen />,
  Beauty: <FaceRetouchingNatural />,
  Books: <MenuBook />,
  Accessories: <Category />,
};

const CategoryCard = ({ category }) => (
  <Box
    component={Link}
    to={`/shop`}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      p: { xs: 1.5, md: 2 },
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      textDecoration: 'none',
      color: 'text.primary',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      '&:hover': {
        borderColor: '#FF9900',
        boxShadow: '0 2px 8px rgba(255,153,0,0.15)',
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        bgcolor: '#FFF3E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#CC7A00',
        '& svg': { fontSize: 24 },
      }}
    >
      {CATEGORY_ICONS[category.name] || <Category />}
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        textAlign: 'center',
        color: 'text.primary',
        lineHeight: 1.3,
      }}
    >
      {category.name}
    </Typography>
  </Box>
);

const SectionHeader = ({ title, linkTo }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2.5,
    }}
  >
    <Typography
      variant="h5"
      component="h2"
      sx={{ fontWeight: 700, color: 'text.primary' }}
    >
      {title}
    </Typography>
    <Button
      component={Link}
      to={linkTo || '/shop'}
      endIcon={<ChevronRight />}
      sx={{
        color: '#FF9900',
        fontWeight: 600,
        fontSize: '0.875rem',
        '&:hover': { bgcolor: '#FFF3E0' },
      }}
    >
      See all
    </Button>
  </Box>
);

const ProductGridSkeleton = () => (
  <Grid container spacing={2.5}>
    {[...Array(4)].map((_, i) => (
      <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="rectangular" height={220} />
          <Box sx={{ p: 1.5 }}>
            <Skeleton width="60%" height={14} sx={{ mb: 0.5 }} />
            <Skeleton width="90%" height={16} />
            <Skeleton width="40%" height={24} sx={{ mt: 1 }} />
          </Box>
        </Box>
      </Grid>
    ))}
  </Grid>
);

const Home = () => {
  const [productsBySell, setProductsBySell] = useState([]);
  const [productsByArrival, setProductsByArrival] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProducts('sold', 8),
      getProducts('createdAt', 8),
      getCategories(),
    ]).then(([sold, arrivals, cats]) => {
      if (!sold.error) setProductsBySell(sold);
      if (!arrivals.error) setProductsByArrival(arrivals);
      if (!cats.error) setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Menu />

      {/* Navbar spacer — account for mobile 2-row navbar */}
      <Box sx={{ pt: { xs: '112px', md: '64px' } }} />

      {/* ── HERO SECTION ── */}
      <Box
        sx={{
          bgcolor: '#131921',
          color: '#fff',
          py: { xs: 5, md: 7 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '40%',
            background: 'radial-gradient(ellipse at right, rgba(255,153,0,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 560, position: 'relative', zIndex: 1 }}>
            <Chip
              label="New Arrivals This Week"
              size="small"
              sx={{
                bgcolor: '#FF9900',
                color: '#172033',
                fontWeight: 700,
                mb: 2,
                fontSize: '0.75rem',
              }}
            />
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                lineHeight: 1.2,
                mb: 2,
                color: '#ffffff',
              }}
            >
              Everything You Need,
              <Box component="span" sx={{ color: '#FF9900', display: 'block' }}>
                Delivered to You
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.7)', mb: 3.5, maxWidth: 420, lineHeight: 1.65 }}
            >
              Shop from thousands of products across fashion, electronics, home,
              and more — with reliable delivery and easy returns.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/shop"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#FF9900',
                  color: '#172033',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.25,
                  fontSize: '0.9375rem',
                  '&:hover': { bgcolor: '#e68a00' },
                }}
              >
                Shop Now
              </Button>
              <Button
                component={Link}
                to="/signup"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  py: 1.25,
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── CATEGORIES ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}
        >
          Shop by Category
        </Typography>
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {categories.slice(0, 12).map((cat) => (
            <Grid key={cat._id} size={{ xs: 3, sm: 2, md: 1.5 }}>
              <CategoryCard category={cat} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── NEW ARRIVALS ── */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: { xs: 3.5, md: 5 } }}>
        <Container maxWidth="lg">
          <SectionHeader title="New Arrivals" linkTo="/shop" />
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <Grid container spacing={2.5}>
              {productsByArrival.slice(0, 8).map((product, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* ── BEST SELLERS ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
        <SectionHeader title="Best Sellers" linkTo="/shop" />
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <Grid container spacing={2.5}>
            {productsBySell.slice(0, 8).map((product, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ── PROMO BANNER ── */}
      <Box
        sx={{
          bgcolor: '#232F3E',
          py: { xs: 4, md: 5 },
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
              Want to sell on Cara?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Reach thousands of customers by listing your products on our marketplace.
            </Typography>
            <Button
              component={Link}
              to="/admin/login"
              variant="contained"
              sx={{
                bgcolor: '#FF9900',
                color: '#172033',
                fontWeight: 700,
                px: 3.5,
                '&:hover': { bgcolor: '#e68a00' },
              }}
            >
              Start Selling
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
