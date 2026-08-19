import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
  Button,
  Chip,
  Alert,
  Box,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { getProducts, updateProduct } from './apiAdmin';

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Stock edit states
  const [stockChanges, setStockChanges] = useState({});
  const [thresholdChanges, setThresholdChanges] = useState({});

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const loadProducts = useCallback(() => {
    getProducts(true).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data);
        
        // Initialize local edit inputs
        const stocks = {};
        const thresholds = {};
        data.forEach((p) => {
          stocks[p._id] = p.quantity;
          thresholds[p._id] = p.lowStockThreshold || 5;
        });
        setStockChanges(stocks);
        setThresholdChanges(thresholds);
      }
    });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleStockChange = (productId, val) => {
    setStockChanges({
      ...stockChanges,
      [productId]: val,
    });
  };

  const handleThresholdChange = (productId, val) => {
    setThresholdChanges({
      ...thresholdChanges,
      [productId]: val,
    });
  };

  const saveProductInventory = (p) => {
    setError('');
    setSuccess('');
    setLoading(true);

    const qty = Number(stockChanges[p._id]);
    const threshold = Number(thresholdChanges[p._id]);

    if (isNaN(qty) || qty < 0) {
      setError('Stock quantity must be a positive integer.');
      setLoading(false);
      return;
    }

    if (isNaN(threshold) || threshold < 1) {
      setError('Low-stock threshold must be at least 1.');
      setLoading(false);
      return;
    }

    const form = new FormData();
    form.set('name', p.name);
    form.set('description', p.description);
    form.set('price', p.price);
    form.set('category', p.category?._id || p.category);
    form.set('shipping', p.shipping ? '1' : '0');
    form.set('quantity', qty);
    form.set('lowStockThreshold', threshold);
    form.set('sku', p.sku || '');
    form.set('isActive', p.isActive ? 'true' : 'false');

    updateProduct(p._id, user._id, token, form).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Inventory for "${p.name}" updated successfully.`);
        loadProducts();
      }
      setLoading(false);
    });
  };

  return (
    <AdminLayout title="Inventory Management">
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Monitor and quickly modify product stock counts and alerts
        </Typography>
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
            Inventory Log ({products.length} Products)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {products.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No items in catalog to manage.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU / ID</TableCell>
                    <TableCell>Sold Qty</TableCell>
                    <TableCell>Stock Status</TableCell>
                    <TableCell>Available Stock</TableCell>
                    <TableCell>Alert Threshold</TableCell>
                    <TableCell align="right">Quick Save</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => {
                    const currentStock = Number(stockChanges[p._id] ?? p.quantity);
                    const currentThreshold = Number(thresholdChanges[p._id] ?? (p.lowStockThreshold || 5));
                    
                    const isOutOfStock = currentStock === 0;
                    const isLowStock = currentStock > 0 && currentStock <= currentThreshold;

                    return (
                      <TableRow key={p._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{p.name}</Typography>
                          {!p.isActive && <Chip size="small" label="Inactive" sx={{ mt: 0.5 }} />}
                        </TableCell>
                        <TableCell>{p.sku || 'N/A'}</TableCell>
                        <TableCell fontWeight="medium">{p.sold || 0} units</TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Chip icon={<ErrorIcon />} label="Out of Stock" color="error" size="small" />
                          ) : isLowStock ? (
                            <Chip icon={<WarningIcon />} label="Low Stock" color="warning" size="small" />
                          ) : (
                            <Chip label="In Stock" color="success" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={stockChanges[p._id] ?? ''}
                            onChange={(e) => handleStockChange(p._id, e.target.value)}
                            inputProps={{ min: 0, style: { width: '80px', fontWeight: 'bold' } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={thresholdChanges[p._id] ?? ''}
                            onChange={(e) => handleThresholdChange(p._id, e.target.value)}
                            inputProps={{ min: 1, style: { width: '60px' } }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Save Stock Details">
                            <span>
                              <IconButton
                                color="success"
                                onClick={() => saveProductInventory(p)}
                                disabled={loading}
                              >
                                <SaveIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ManageInventory;
