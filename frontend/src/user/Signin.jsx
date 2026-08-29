import React, { useState } from 'react';

import { Navigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Divider,
}  from '@mui/material';
import { Store, LockOutlined } from '@mui/icons-material';
import Copyright from '../core/Copyright.jsx';
import Menu from '../core/Menu.jsx';
import { signin, authenticate, isAuthenticated } from '../auth';

export default function Signin() {
  const [values, setValues] = useState({
    email: '',
    password: '',
    error: '',
    loading: false,
    redirectToReferrer: false,
    rememberMe: false,
  });

  const { email, password, loading, error, redirectToReferrer, rememberMe } = values;

  const handleChange = (name) => (event) => {
    const value = name === 'rememberMe' ? event.target.checked : event.target.value;
    setValues({ ...values, error: '', [name]: value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: '', loading: true });
    signin({ email, password, rememberMe }).then((data) => {
      if (!data || data.error) {
        setValues({ ...values, error: data?.error || 'Something went wrong.', loading: false });
      } else {
        authenticate(data, () => {
          setValues({ ...values, loading: false, redirectToReferrer: true });
        });
      }
    });
  };

  // ─── Guard: redirect BEFORE rendering form ───
  // Already logged in
  if (isAuthenticated()) {
    const auth = isAuthenticated();
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');
    if (redirect) return <Navigate to={redirect} replace />;
    if (auth.user && ['admin', 'seller', 'superadmin'].includes(auth.user.role)) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  // Just authenticated via form submit
  if (redirectToReferrer) {
    const auth = isAuthenticated();
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');
    if (redirect) return <Navigate to={redirect} replace />;
    if (auth && auth.user && ['admin', 'seller', 'superadmin'].includes(auth.user.role)) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Menu />

      <Box
        sx={{
          pt: { xs: '120px', md: '88px' },
          pb: 6,
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Container component="main" maxWidth="xs">
          {/* Brand */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              component={Link}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
            >
              <Store sx={{ color: '#FF9900', fontSize: 28 }} />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'text.primary',
                  '& span': { color: '#FF9900' },
                }}
              >
                Ca<span>ra</span>
              </Typography>
            </Box>
          </Box>

          {/* Form Card */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: { xs: 3, sm: 4 },
            }}
          >
            {/* Card Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#FFF3E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LockOutlined sx={{ color: '#CC7A00', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography component="h1" variant="h6" sx={{ fontWeight: 700, color: '#172033', lineHeight: 1 }}>
                  Sign In
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sign in to your Cara account
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={clickSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={handleChange('email')}
                type="email"
                value={email}
                autoFocus
                sx={{ mb: 1.5 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                onChange={handleChange('password')}
                value={password}
                autoComplete="current-password"
                sx={{ mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    checked={rememberMe}
                    onChange={handleChange('rememberMe')}
                    sx={{ color: '#FF9900', '&.Mui-checked': { color: '#FF9900' } }}
                  />
                }
                label={<Typography variant="body2">Remember me</Typography>}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#FF9900',
                  color: '#172033',
                  fontWeight: 700,
                  py: 1.25,
                  fontSize: '0.9375rem',
                  '&:hover': { bgcolor: '#e68a00' },
                  '&.Mui-disabled': { bgcolor: '#f5f5f5', color: '#aaa' },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: '#172033' }} />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 2.5 }} />

              <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                <Grid>
                  <Typography variant="body2" color="text.secondary">
                    <Link to="/forgot-password" style={{ color: '#2563EB', textDecoration: 'none' }}>
                      Forgot password?
                    </Link>
                  </Typography>
                </Grid>
                <Grid>
                  <Typography variant="body2" color="text.secondary">
                    New?{' '}
                    <Link to="/signup" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                      Create account
                    </Link>
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Admin or Seller?
                </Typography>
                <Button
                  component={Link}
                  to="/admin/login"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  Admin / Seller Login →
                </Button>
              </Box>
            </Box>
          </Box>

          <Box mt={4}>
            <Copyright />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
