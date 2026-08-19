import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { createCategory } from './apiAdmin';

const AddCategory = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const handleChange = (e) => {
    setError('');
    setName(e.target.value);
  };

  const clickSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    createCategory(user._id, token, { name }).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setError('');
        setSuccess(true);
        setName('');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    });
  };

  const newCategoryForm = () => (
    <Box
      component="form"
      onSubmit={clickSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        width: '100%',
        mt: 2,
      }}
    >
      <TextField
        label="Category Name"
        variant="outlined"
        value={name}
        onChange={handleChange}
        autoFocus
        required
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ px: 4, py: 1.2, fontWeight: 'bold' }}
        >
          Create Category
        </Button>
        <Button
          component={Link}
          to="/admin/dashboard"
          variant="outlined"
          color="secondary"
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );

  return (
    <AdminLayout title="Add Category">
      <Card elevation={2} sx={{ maxWidth: 600, mx: 'auto', p: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Create Product Category
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Define new classification groups for organizing inventory items
          </Typography>
          <Divider sx={{ mb: 3, mt: 1 }} />

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              Category has been created successfully! Redirecting...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error} (Category must be unique)
            </Alert>
          )}

          {newCategoryForm()}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AddCategory;
