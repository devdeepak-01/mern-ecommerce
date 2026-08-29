import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import {
  Box ,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { Store, AdminPanelSettings } from '@mui/icons-material';
import { signin, authenticate, isAuthenticatedAdmin, signout } from '../auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: '',
    password: '',
    error: '',
    loading: false,
    redirectToReferrer: false,
    rememberMe: false,
  });

  const { email, password, loading, error, redirectToReferrer, rememberMe } = values;

  useEffect(() => {
    const auth = isAuthenticatedAdmin();
    if (auth && ['admin', 'seller', 'superadmin'].includes(auth.user?.role)) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (name) => (event) => {
    const value = name === 'rememberMe' ? event.target.checked : event.target.value;
    setValues({ ...values, error: '', [name]: value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      setValues({ ...values, error: 'Email and password are required' });
      return;
    }
    setValues({ ...values, error: '', loading: true });
    signin({ email, password, rememberMe }).then((data) => {
      if (!data || data.error) {
        setValues({ ...values, error: data?.error || 'Sign in failed.', loading: false });
      } else {
        if (!['admin', 'seller', 'superadmin'].includes(data.user?.role)) {
          signout(() => {
            setValues({
              ...values,
              error: 'Access Denied: You do not have administrator or seller privileges.',
              loading: false,
            });
          }, 'admin');
        } else {
          authenticate(data, () => {
            setValues({ ...values, loading: false, redirectToReferrer: true });
          }, 'admin');
        }
      }
    });
  };

  if (redirectToReferrer) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
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
              sx={{ fontWeight: 700, fontSize: '1.5rem', color: 'text.primary', '& span': { color: '#FF9900' } }}
            >
              Ca<span>ra</span>
            </Typography>
          </Box>
        </Box>

        {/* Card */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                bgcolor: '#131921',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <AdminPanelSettings sx={{ color: '#FF9900', fontSize: 26 }} />
            </Box>
            <Typography component="h1" variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Admin / Seller Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to access your seller dashboard
            </Typography>
            <Chip
              label="Restricted Access"
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: '#FFF3E0',
                color: '#CC7A00',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
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
              label="Admin Email"
              name="email"
              autoComplete="email"
              onChange={handleChange('email')}
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
              color="primary"
              disabled={loading}
              sx={{
                fontWeight: 700,
                py: 1.25,
                fontSize: '0.9375rem',
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In to Dashboard'}
            </Button>

            <Divider sx={{ my: 2.5 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Not an admin?{' '}
                <Link to="/signin" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                  Customer Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
