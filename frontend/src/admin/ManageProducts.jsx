import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Chip,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { getProducts, deleteProduct } from './apiAdmin';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError('');
    getProducts(true)
      .then((data) => {
        if (!data || data.error) {
          setError(data?.error || 'Failed to load products.');
          setProducts([]);
        } else {
          setProducts(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network error while retrieving products.');
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const destroy = (productId) => {
    if (window.confirm('Are you sure you want to delete or deactivate this product?')) {
      if (!user?._id || !token) return;
      setError('');
      setSuccess('');
      deleteProduct(productId, user._id, token)
        .then((data) => {
          if (!data || data.error) {
            setError(data?.error || 'Could not delete product.');
          } else {
            setSuccess(data.message || 'Product updated successfully.');
            loadProducts();
          }
        })
        .catch(() => {
          setError('Network error while deleting product.');
        });
    }
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <AdminLayout title="Manage Products">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Create, edit, or deactivate catalog items
        </Typography>
        <Button
          component={Link}
          to="/create/product"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Catalog (Total: {products.length} items)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No products in catalog. Click "Add Product" to create one.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 60 }}>Image</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock Qty</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p._id} hover>
                      <TableCell>
                        <Box
                          component="img"
                          src={p.imageUrl || `/api/product/photo/${p._id}`}
                          alt={p.name}
                          onError={(e) => { e.currentTarget.src = '/images/image-placeholder.svg'; }}
                          sx={{
                            width: 44,
                            height: 44,
                            objectFit: 'contain',
                            borderRadius: 1,
                            backgroundColor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            p: 0.5,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{p.name}</TableCell>
                      <TableCell>{p.sku || 'N/A'}</TableCell>
                      <TableCell>{p.category?.name || 'Uncategorized'}</TableCell>
                      <TableCell fontWeight="bold">${(p.price || 0).toFixed(2)}</TableCell>
                      <TableCell sx={{ color: p.quantity === 0 ? 'error.main' : 'text.primary', fontWeight: 600 }}>
                        {p.quantity || 0} units
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.isActive !== false ? 'Active' : 'Deactivated'}
                          color={p.isActive !== false ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Product Details">
                          <IconButton
                            component={Link}
                            to={`/admin/product/update/${p._id}`}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={p.isActive !== false ? 'Deactivate / Delete' : 'Permanently Delete'}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => destroy(p._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ManageProducts;
