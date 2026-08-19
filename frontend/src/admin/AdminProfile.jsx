import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
} from '@mui/material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { read, update, updateUser } from '../user/apiUser';

const AdminProfile = () => {
  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;
  const userId = user?._id;
  
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    error: '',
    success: false,
    loading: false,
  });

  const { name, email, password, error, success, loading } = values;

  useEffect(() => {
    const init = (id) => {
      read(id, token).then((data) => {
        if (data.error) {
          setValues((v) => ({ ...v, error: data.error }));
        } else {
          setValues((v) => ({ ...v, name: data.name, email: data.email }));
        }
      });
    };

    if (userId) {
      init(userId);
    }
  }, [userId, token]);

  const handleChange = (fieldName) => (e) => {
    setValues((v) => ({ ...v, error: '', [fieldName]: e.target.value }));
  };

  const clickSubmit = (e) => {
    e.preventDefault();
    setValues((v) => ({ ...v, loading: true, error: '' }));
    
    update(user._id, token, { name, email, password }).then((data) => {
      if (data.error) {
        setValues((v) => ({ ...v, error: data.error, loading: false }));
      } else {
        updateUser(data, () => {
          setValues((v) => ({
            ...v,
            name: data.name,
            email: data.email,
            password: '',
            success: true,
            loading: false,
          }));
        });
      }
    });
  };

  return (
    <AdminLayout title="Admin Profile">
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully! Redirecting to dashboard...
          <Navigate to="/admin/dashboard" replace />
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }} elevation={2}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Administrative Profile Settings
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Manage name and update authentication credentials
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={clickSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Name"
              variant="outlined"
              onChange={handleChange('name')}
              value={name}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              type="email"
              variant="outlined"
              value={email}
              disabled
              helperText="Administrative email addresses cannot be modified online"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Update Password"
              type="password"
              variant="outlined"
              onChange={handleChange('password')}
              value={password}
              placeholder="Leave empty to keep existing password"
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 3, py: 1.2, fontWeight: 'bold' }}
              fullWidth
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile Details'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminProfile;
