import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Divider,
  Typography,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import moment from 'moment';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { listOrders, getStatusValues, updateOrderStatus } from './apiAdmin';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;
  const userId = user?._id;

  const loadOrders = useCallback(() => {
    if (userId && token) {
      setLoading(true);
      listOrders(userId, token).then((data) => {
        if (!data || data.error) {
          setError(data?.error || 'Failed to load orders.');
          setOrders([]);
        } else {
          setOrders(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      }).catch((err) => {
        setError('Network error while retrieving orders.');
        setOrders([]);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [userId, token]);

  const loadStatusValues = useCallback(() => {
    if (userId && token) {
      getStatusValues(userId, token).then((data) => {
        if (data && !data.error && Array.isArray(data)) {
          setStatusValues(data);
        }
      }).catch(() => {});
    }
  }, [userId, token]);

  useEffect(() => {
    loadOrders();
    loadStatusValues();
  }, [loadOrders, loadStatusValues]);

  const handleStatusChange = (e, orderId) => {
    setError('');
    setSuccess('');
    const newStatus = e.target.value;

    if (!user?._id || !token) return;

    updateOrderStatus(user._id, token, orderId, newStatus).then((data) => {
      if (!data || data.error) {
        setError(data?.error || 'Failed to update order status.');
      } else {
        setSuccess(`Order status updated to "${newStatus}" successfully.`);
        loadOrders();
      }
    }).catch(() => {
      setError('Network error while updating status.');
    });
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'success';
    if (s.includes('shipped')) return 'info';
    if (s.includes('processing')) return 'warning';
    if (s.includes('cancelled')) return 'error';
    return 'default';
  };

  const getValidNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'Not processed':
        return ['Confirmed', 'Cancelled'];
      case 'Confirmed':
        return ['Processing', 'Cancelled'];
      case 'Processing':
        return ['Shipped', 'Cancelled'];
      case 'Shipped':
        return ['Delivered', 'Cancelled'];
      case 'Cancelled':
        return ['Refunded'];
      default:
        return [];
    }
  };

  return (
    <AdminLayout title="Order Management">
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Track and modify order processing queues and deliveries
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
            Transactions Queue (Total: {orders.length} orders)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No orders logged.
            </Typography>
          ) : (
            orders.map((o) => {
              const allowedStatuses = getValidNextStatuses(o.status);
              const orderProducts = Array.isArray(o.products) ? o.products : [];
              
              return (
                <Card key={o._id} variant="outlined" sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                  {/* Order Header */}
                  <Box sx={{ bgcolor: 'action.hover', p: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Order ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{o._id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {o.user ? `${o.user.name || 'Customer'} (${o.user.email || ''})` : 'Guest'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">${(o.amount || 0).toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography variant="body2">{moment(o.createdAt).format('lll')}</Typography>
                    </Box>
                    <Box>
                      <Button
                        component={Link}
                        to={`/order/invoice/${o._id}`}
                        variant="outlined"
                        size="small"
                      >
                        Print Invoice
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Order Body */}
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* Left pane: Products list */}
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
                          Purchased Items ({orderProducts.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" elevation={0}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell align="right">Qty</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {orderProducts.map((p, idx) => (
                                <TableRow key={idx}>
                                  <TableCell fontWeight="medium">{p.name || 'Product Details Deleted'}</TableCell>
                                  <TableCell align="right">{p.count || 1}x</TableCell>
                                  <TableCell align="right">${(p.price || 0).toFixed(2)}</TableCell>
                                  <TableCell align="right" fontWeight="bold">
                                    ${((p.count || 1) * (p.price || 0)).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>

                      {/* Right pane: Status & Address updates */}
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
                          Logistics & Tracking
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Status pill & Update Selector */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">Current Status:</Typography>
                            <Chip label={o.status} color={getStatusColor(o.status)} sx={{ fontWeight: 'bold' }} />
                          </Box>

                          <FormControl fullWidth size="small">
                            <InputLabel id={`status-label-${o._id}`}>Change Status To...</InputLabel>
                            <Select
                              labelId={`status-label-${o._id}`}
                              value=""
                              label="Change Status To..."
                              onChange={(e) => handleStatusChange(e, o._id)}
                              disabled={allowedStatuses.length === 0}
                            >
                              {statusValues.map((status, index) => {
                                const isAllowed = allowedStatuses.includes(status);
                                return (
                                  <MenuItem
                                    key={index}
                                    value={status}
                                    disabled={!isAllowed}
                                    sx={{ fontWeight: isAllowed ? 'bold' : 'normal' }}
                                  >
                                    {status} {!isAllowed && '(Invalid transition)'}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>

                          {allowedStatuses.length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Order is complete ({o.status}). No further transitions allowed.
                            </Typography>
                          )}

                          <Divider sx={{ my: 0.5 }} />

                          {/* Logistics Info */}
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Shipping Address</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{o.address}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">Transaction Nonce / ID</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>{o.transaction_id || 'N/A'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Orders;
