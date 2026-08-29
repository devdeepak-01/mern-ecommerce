import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingBag as ProductsIcon,
  Inventory as InventoryIcon,
  ListAlt as OrdersIcon,
  People as CustomersIcon,
  Receipt as BillingIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon,
  Storefront as StoreIcon,
  LightMode,
  DarkMode,
  SettingsBrightness,
  SupervisedUserCircle as SuperUserIcon,
  Security as RolesIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext.jsx';
import { isAuthenticatedAdmin as isAuthenticated, signout } from '../auth';

const drawerWidth = 240;

const AdminLayout = ({ children, title = 'Admin Panel' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeMode, changeThemeMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);

  const { user } = isAuthenticated() || { user: {} };
  const isSuper = user && user.role === 'superadmin';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  const handleThemeMenuOpen = (e) => setThemeAnchorEl(e.currentTarget);
  const handleThemeMenuClose = () => setThemeAnchorEl(null);
  const handleSelectTheme = (mode) => { changeThemeMode(mode); handleThemeMenuClose(); };

  const handleLogout = () => {
    signout(() => navigate('/admin/login'), 'admin');
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return <LightMode />;
    if (themeMode === 'dark') return <DarkMode />;
    return <SettingsBrightness />;
  };

  

  const baseMenuItems = [
    { text: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: 'Products', to: '/admin/products', icon: <ProductsIcon /> },
    { text: 'Inventory', to: '/admin/inventory', icon: <InventoryIcon /> },
    { text: 'Orders', to: '/admin/orders', icon: <OrdersIcon /> },
    { text: 'Customers', to: '/admin/customers', icon: <CustomersIcon /> },
    { text: 'Billing', to: '/admin/billing', icon: <BillingIcon /> },
  ];

  const superMenuItems = isSuper
    ? [
        { text: 'User Governance', to: '/superadmin/users', icon: <SuperUserIcon /> },
        { text: 'Roles & RBAC', to: '/superadmin/roles', icon: <RolesIcon /> },
      ]
    : [];

  const menuItems = [
    ...baseMenuItems,
    ...superMenuItems,
    { text: 'Profile', to: '/admin/profile', icon: <ProfileIcon /> },
  ];

  const isActive = (path) => location.pathname === path;

  const isDark = theme.palette.mode === 'dark';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#18101F' : '#131921' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 2.25,
          borderBottom: isDark ? '1px solid rgba(244, 114, 182, 0.16)' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <StoreIcon sx={{ color: isDark ? '#F472B6' : '#FF9900', fontSize: 22 }} />
        <Typography
          component={Link}
          to="/admin/dashboard"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            textDecoration: 'none',
            color: '#ffffff',
            '& span': { color: isDark ? '#F472B6' : '#FF9900' },
          }}
        >
          Ca<span>ra</span>
          <Typography
            component="span"
            sx={{ fontSize: '0.75rem', color: isDark ? '#C4B5C7' : 'rgba(255,255,255,0.5)', ml: 0.75, fontWeight: 400 }}
          >
            Admin
          </Typography>
        </Typography>
      </Box>

      {/* User info */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: isDark ? '1px solid rgba(244, 114, 182, 0.16)' : '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: isDark ? '#F472B6' : '#FF9900',
            color: isDark ? '#18101F' : '#131921',
            width: 36,
            height: 36,
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </Avatar>
        <Box sx={{ overflow: 'hidden', flex: 1 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}
          >
            {user.name || 'Admin'}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: user.role === 'superadmin' ? (isDark ? '#F472B6' : '#FF9900') : (isDark ? '#C4B5C7' : 'rgba(255,255,255,0.45)'),
              display: 'block',
              lineHeight: 1.3,
              fontWeight: user.role === 'superadmin' ? 700 : 400,
            }}
          >
            {user.role === 'superadmin'
              ? 'Super Administrator'
              : user.role === 'admin'
              ? 'Seller / Admin'
              : user.role}
          </Typography>
        </Box>
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1.25, pt: 1.5, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.to);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.to}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 1.5,
                  pl: 1.5,
                  borderLeft: active ? `3px solid ${isDark ? '#F472B6' : '#FF9900'}` : '3px solid transparent',
                  bgcolor: active
                    ? isDark
                      ? 'rgba(244, 114, 182, 0.18)'
                      : 'rgba(255,153,0,0.12)'
                    : 'transparent',
                  '&:hover': {
                    bgcolor: active
                      ? isDark
                        ? 'rgba(244, 114, 182, 0.24)'
                        : 'rgba(255,153,0,0.15)'
                      : isDark
                      ? 'rgba(244, 114, 182, 0.1)'
                      : 'rgba(255,255,255,0.06)',
                  },
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active
                      ? isDark
                        ? '#F472B6'
                        : '#FF9900'
                      : isDark
                      ? '#C4B5C7'
                      : 'rgba(255,255,255,0.55)',
                    minWidth: 38,
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    color: active
                      ? '#ffffff'
                      : isDark
                      ? '#E2D4E0'
                      : 'rgba(255,255,255,0.75)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom actions */}
      <Divider sx={{ borderColor: isDark ? 'rgba(244, 114, 182, 0.16)' : 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 1.25, py: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={Link}
            to="/"
            sx={{
              borderRadius: 1.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.45)', minWidth: 38, '& svg': { fontSize: 20 } }}>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText
              primary="Go to Storefront"
              primaryTypographyProps={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1.5,
              '&:hover': { bgcolor: 'rgba(220,53,69,0.15)' },
            }}
          >
            <ListItemIcon sx={{ color: '#f87171', minWidth: 38, '& svg': { fontSize: 20 } }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Sign Out"
              primaryTypographyProps={{ fontSize: '0.8125rem', color: '#f87171' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: isDark ? '#1C1424' : '#232F3E',
          color: '#ffffff',
          boxShadow: 'none',
          borderBottom: isDark ? '1px solid rgba(244, 114, 182, 0.16)' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600, color: '#ffffff', fontSize: '1rem' }}>
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Theme Toggle */}
            <Tooltip title="Choose Theme">
              <IconButton onClick={handleThemeMenuOpen} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {getThemeIcon()}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={themeAnchorEl}
              open={Boolean(themeAnchorEl)}
              onClose={handleThemeMenuClose}
              PaperProps={{ sx: { mt: 1 } }}
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

            {/* Profile avatar */}
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, ml: 0.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: isDark ? '#F472B6' : '#FF9900',
                  color: isDark ? '#18101F' : '#131921',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { mt: 1, minWidth: 160 } }}
            >
              <MenuItem component={Link} to="/admin/profile" onClick={handleProfileMenuClose}>
                <ListItemIcon><ProfileIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                <ListItemText>Sign Out</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: isDark ? '#18101F' : '#131921',
              backgroundImage: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: isDark ? '#18101F' : '#131921',
              backgroundImage: 'none',
              border: 'none',
              borderRight: isDark ? '1px solid rgba(244, 114, 182, 0.16)' : '1px solid rgba(255,255,255,0.06)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '60px',
          minHeight: 'calc(100vh - 60px)',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};


export default AdminLayout;
