import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as CartIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';

const UserSidebar = ({ userId }) => {
  const location = useLocation();

  const LINKS = [
    { text: 'My Dashboard', to: '/user/dashboard', icon: <DashboardIcon /> },
    { text: 'My Cart', to: '/cart', icon: <CartIcon /> },
    { text: 'Update Profile', to: `/profile/${userId}`, icon: <ProfileIcon /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Grid size={{ xs: 12, md: 3 }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.6px',
            }}
          >
            My Account
          </Typography>
        </Box>

        <Divider />

        <List dense sx={{ py: 0.5, px: 0.75 }}>
          {LINKS.map((link, index) => {
            const active = isActive(link.to);
            return (
              <React.Fragment key={link.text}>
                <ListItemButton
                  component={Link}
                  to={link.to}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.25,
                    pl: 1.5,
                    borderLeft: active ? '3px solid #FF9900' : '3px solid transparent',
                    bgcolor: active ? '#FFF3E0' : 'transparent',
                    '&:hover': {
                      bgcolor: active ? '#FFF3E0' : 'rgba(0,0,0,0.04)',
                    },
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? '#CC7A00' : 'text.secondary',
                      minWidth: 36,
                    }}
                  >
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={link.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#CC7A00' : 'text.primary',
                    }}
                  />
                </ListItemButton>
                {index < LINKS.length - 1 && (
                  <Divider component="li" sx={{ mx: 1, my: 0.25 }} />
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Grid>
  );
};

export default UserSidebar;
