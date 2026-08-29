import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Store, PersonAdd } from '@mui/icons-material';
import Copyright from '../core/Copyright.jsx';
import Menu from '../core/Menu.jsx';
import { signup, isAuthenticated } from '../auth/index.js';

export default function Signup() {

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    error: '',
    success: false,
    loading: false,
  });

  const { name, email, password, success, error, loading } = values;

  const handleChange = (name) => (event) => {
    setValues({ ...values, error: '', [name]: event.target.value });
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues({ ...values, error: '', loading: true });
    signup({ name, email, password }).then ((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error, success: false, loading: false });
      } else {
        setValues({ name: '', email: '', password: '', error: '', success: true, loading: false });
      }
    });
  };

  // Redirect if already logged in (after hooks)
  if (isAuthenticated()) return <Navigate to="/" replace />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Menu />
      <Box sx={{ pt: { xs: '120px', md: '88px' }, pb: 6, flex: 1, display: 'flex', justifyContent: 'center' }}>

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
                }}
              >
                <PersonAdd sx={{ color: '#CC7A00', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography component="h1" variant="h6" sx={{ fontWeight: 700, color: '#172033', lineHeight: 1 }}>
                  Create Account
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Join Cara and start shopping
                </Typography>
              </Box>
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 1.5 }}>
                Account created!{' '}
                <Link to="/signin" style={{ color: '#198754', fontWeight: 600 }}>
                  Sign In now
                </Link>
              </Alert>
            )}
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
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={handleChange('name')}
                sx={{ mb: 1.5 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={handleChange('email')}
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
                autoComplete="new-password"
                value={password}
                onChange={handleChange('password')}
                inputProps={{ minLength: 6 }}
                helperText="Minimum 6 characters"
                sx={{ mb: 2.5 }}
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
                {loading ? <CircularProgress size={22} sx={{ color: '#172033' }} /> : 'Create Account'}
              </Button>

              <Divider sx={{ my: 2.5 }} />

              <Grid container justifyContent="center">
                <Grid>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link to="/signin" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                      Sign In
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
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
