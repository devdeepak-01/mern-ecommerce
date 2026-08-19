import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signout, isAuthenticated, isAuthenticatedAdmin } from '../auth';
import { itemTotal } from './cartHelpers';
import { useThemeMode } from '../context/ThemeContext.jsx';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  InputBase,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Home,
  Storefront,
  Dashboard,
  AccountCircle,
  PersonAdd,
  ExitToApp,
  Store,
  Menu as MenuIcon,
  Search as SearchIcon,
  LightMode,
  DarkMode,
  SettingsBrightness,
} from '@mui/icons-material';

const MaterialAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { themeMode, changeThemeMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Reactive cart count
  const [cartCount, setCartCount] = useState(itemTotal());

  // Update cart badge whenever localStorage changes or location changes
  useEffect(() => {
    const syncCart = () => setCartCount(itemTotal());
    syncCart();
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, [location]);

  const isMobileMenuOpen = Boolean(mobileAnchorEl);
  const isThemeMenuOpen = Boolean(themeAnchorEl);

  const handleMobileMenuOpen = (e) => setMobileAnchorEl(e.currentTarget);
  const handleMobileMenuClose = () => setMobileAnchorEl(null);
  const handleThemeMenuOpen = (e) => setThemeAnchorEl(e.currentTarget);
  const handleThemeMenuClose = () => setThemeAnchorEl(null);
  const handleSelectTheme = (mode) => { changeThemeMode(mode); handleThemeMenuClose(); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSignout = () => {
    if (isAuthenticated()) {
      signout(() => {}, 'customer');
    }
    if (isAuthenticatedAdmin()) {
      signout(() => {}, 'admin');
    }
    handleMobileMenuClose();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getThemeIcon = () => {
    if (themeMode === 'light') return <LightMode />;
    if (themeMode === 'dark') return <DarkMode />;
    return <SettingsBrightness />;
  };

  const navLinkSx = (path) => ({
    color: 'rgba(255,255,255,0.9)',
    fontWeight: isActive(path) ? 600 : 400,
    fontSize: '0.875rem',
    px: 1.5,
    py: 0.75,
    borderRadius: 0,
    borderBottom: isActive(path) ? '2px solid #FF9900' : '2px solid transparent',
    minWidth: 'unset',
    '&:hover': {
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderBottom: isActive(path) ? '2px solid #FF9900' : '2px solid rgba(255,255,255,0.3)',
    },
    transition: 'all 0.15s ease-in-out',
  });

  const SearchBar = () => (
    <Box
      component="form"
      onSubmit={handleSearchSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 1,
        overflow: 'hidden',
        flex: { xs: 1, md: 'none' },
        width: { md: 400, lg: 520 },
        mx: { xs: 1, md: 2 },
        '&:focus-within': {
          bgcolor: '#ffffff',
          border: '1px solid #FF9900',
          '& .search-input input': { color: '#172033' },
          '& .search-input input::placeholder': { color: '#8A94A6' },
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <InputBase
        className="search-input"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          flex: 1,
          pl: 1.5,
          pr: 0.5,
          py: 0.75,
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.9)',
          '& input::placeholder': { color: 'rgba(255,255,255,0.6)', opacity: 1 },
        }}
        inputProps={{ 'aria-label': 'search products' }}
      />
      <Box
        component="button"
        type="submit"
        sx={{
          bgcolor: '#FF9900',
          border: 'none',
          cursor: 'pointer',
          px: 1.5,
          py: 1.15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#172033',
          transition: 'background-color 0.15s ease-in-out',
          flexShrink: 0,
          '&:hover': { bgcolor: '#e68a00' },
        }}
        aria-label="submit search"
      >
        <SearchIcon sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  );

  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          gap: 1,
          minHeight: { xs: 56, md: 64 },
          px: { xs: 1.5, md: 2 },
        }}
      >
        {/* LEFT: Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{ color: '#FF9900', mr: 0.5, p: 0.5 }}
            aria-label="Cara home"
          >
            <Store sx={{ fontSize: 26 }} />
          </IconButton>
          <Typography
            component={Link}
            to="/"
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '1.2rem', md: '1.35rem' },
              textDecoration: 'none',
              color: '#ffffff',
              letterSpacing: '0.5px',
              '& span': { color: '#FF9900' },
            }}
          >
            Ca<span>ra</span>
          </Typography>
        </Box>

        {/* CENTER: Search bar (desktop) */}
        {!isMobile && <SearchBar />}

        {/* RIGHT: Nav links + icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {!isMobile ? (
            // ─── DESKTOP NAV ───
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button component={Link} to="/" sx={navLinkSx('/')}>Home</Button>
              <Button component={Link} to="/shop" sx={navLinkSx('/shop')}>Shop</Button>

              {/* Cart — single icon with badge */}
              <IconButton
                component={Link}
                to="/cart"
                sx={{
                  color: isActive('/cart') ? '#FF9900' : 'rgba(255,255,255,0.9)',
                  borderRadius: 0,
                  px: 1,
                  borderBottom: isActive('/cart') ? '2px solid #FF9900' : '2px solid transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' },
                }}
                aria-label="cart"
              >
                <Badge badgeContent={cartCount || null} color="error">
                  <ShoppingCart sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>

              {isAuthenticated() && isAuthenticated().user?.role === 'customer' && (
                <Button component={Link} to="/user/dashboard" sx={navLinkSx('/user/dashboard')}>
                  My Account
                </Button>
              )}
              {isAuthenticatedAdmin() && ['admin', 'seller', 'superadmin'].includes(isAuthenticatedAdmin().user?.role) && (
                <Button component={Link} to="/admin/dashboard" sx={navLinkSx('/admin/dashboard')}>
                  Dashboard
                </Button>
              )}
              {!isAuthenticated() && (
                <>
                  <Button component={Link} to="/signin" startIcon={<AccountCircle sx={{ fontSize: 18 }} />} sx={navLinkSx('/signin')}>
                    Sign In
                  </Button>
                  <Button component={Link} to="/signup" startIcon={<PersonAdd sx={{ fontSize: 18 }} />} sx={navLinkSx('/signup')}>
                    Sign Up
                  </Button>
                </>
              )}
              {(isAuthenticated() || isAuthenticatedAdmin()) && (
                <Button onClick={handleSignout} startIcon={<ExitToApp sx={{ fontSize: 18 }} />} sx={{ ...navLinkSx(''), color: 'rgba(255,255,255,0.7)', ml: 0.5 }}>
                  Sign Out
                </Button>
              )}
            </Box>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={handleMobileMenuOpen}
              sx={{ color: 'rgba(255,255,255,0.9)' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Theme Toggle */}
          <Tooltip title="Choose theme">
            <IconButton
              onClick={handleThemeMenuOpen}
              aria-label="select theme"
              sx={{ color: 'rgba(255,255,255,0.7)', ml: 0.5 }}
            >
              {getThemeIcon()}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={themeAnchorEl}
            open={isThemeMenuOpen}
            onClose={handleThemeMenuClose}
            PaperProps={{ sx: { mt: 1, minWidth: 140 } }}
          >
            <MenuItem onClick={() => handleSelectTheme('light')} selected={themeMode === 'light'}>
              <ListItemIcon><LightMode fontSize="small" /></ListItemIcon>
              <ListItemText>Light</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectTheme('dark')} selected={themeMode === 'dark'}>
              <ListItemIcon><DarkMode fontSize="small" /></ListItemIcon>
              <ListItemText>Dark</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectTheme('system')} selected={themeMode === 'system'}>
              <ListItemIcon><SettingsBrightness fontSize="small" /></ListItemIcon>
              <ListItemText>System</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Mobile search bar — second row */}
      {isMobile && (
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <SearchBar />
        </Box>
      )}

      {/* Mobile nav menu */}
      <Menu
        anchorEl={mobileAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: '#232F3E',
            color: '#fff',
            mt: 1,
            '& .MuiMenuItem-root': {
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            },
          },
        }}
      >
        {[
          { path: '/', label: 'Home', icon: <Home />, show: true },
          { path: '/shop', label: 'Shop', icon: <Storefront />, show: true },
          {
            path: '/cart',
            label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}`,
            icon: <Badge badgeContent={cartCount || null} color="error"><ShoppingCart /></Badge>,
            show: true,
          },
          {
            path: '/user/dashboard',
            label: 'My Account',
            icon: <Dashboard />,
            show: isAuthenticated() && isAuthenticated().user?.role === 'customer',
          },
          {
            path: '/admin/dashboard',
            label: 'Dashboard',
            icon: <Dashboard />,
            show: isAuthenticatedAdmin() && ['admin', 'seller', 'superadmin'].includes(isAuthenticatedAdmin().user?.role),
          },
          { path: '/signin', label: 'Sign In', icon: <AccountCircle />, show: !isAuthenticated() },
          { path: '/signup', label: 'Sign Up', icon: <PersonAdd />, show: !isAuthenticated() },
        ]
          .filter((i) => i.show)
          .map((item) => (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleMobileMenuClose}
              sx={{
                bgcolor: isActive(item.path) ? 'rgba(255,153,0,0.15)' : 'transparent',
                borderLeft: isActive(item.path) ? '3px solid #FF9900' : '3px solid transparent',
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? '#FF9900' : 'rgba(255,255,255,0.7)', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </MenuItem>
          ))}

        {(isAuthenticated() || isAuthenticatedAdmin()) && (
          <>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', my: 0.5 }} />
            <MenuItem onClick={handleSignout} sx={{ color: '#f87171 !important' }}>
              <ListItemIcon sx={{ color: '#f87171', minWidth: 36 }}><ExitToApp /></ListItemIcon>
              <ListItemText primary="Sign Out" />
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default MaterialAppBar;
