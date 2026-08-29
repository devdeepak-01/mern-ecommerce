import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ShoppingBag as ProductsIcon,
  People as CustomersIcon,
  ListAlt as OrdersIcon,
  AttachMoney as RevenueIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
} from  '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { getDashboardStats } from '../admin/apiAdmin';
import { Link } from 'react-router-dom';
import moment from 'moment';

const AdminDashboard = () => {
  const [stats , setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const loadStats = useCallback(() => {
    if (user?._id && token) {
      setLoading(true);
      setError('');
      getDashboardStats(user._id, token).then((data) => {
        if (!data || data.error) {
          setError(data?.error || 'Failed to load dashboard statistics.');
        } else {
          setStats(data);
        }
        setLoading(false);
      }).catch(() => {
        setError('Network error while retrieving statistics.');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user?._id, token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'success';
    if (s.includes('shipped')) return 'info';
    if (s.includes('processing')) return 'warning';
    if (s.includes('cancelled')) return 'error';
    return 'default';
  };

  if (loading && !stats) {
    return (
      <AdminLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  const {
    totalProducts = 0,
    totalCustomers = 0,
    totalOrders = 0,
    orderStats = {},
    totalSales = 0,
    totalInventory = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
    lowStockProducts = [],
    outOfStockProducts = [],
    recentOrders = [],
  } = stats || {};

  return (
    <AdminLayout title="Seller Dashboard">
      {/* Refresh Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Overview of your e-commerce operations
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={loadStats}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Sales */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.contrastText', width: 56, height: 56 }}>
                <RevenueIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Total Sales / Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${totalSales.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            component={Link}
            to="/admin/orders"
            elevation={2}
            sx={{
              height: '100%',
              display: 'block',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 56, height: 56 }}>
                <OrdersIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Total Orders
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {totalOrders}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Products */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            component={Link}
            to="/admin/products"
            elevation={2}
            sx={{
              height: '100%',
              display: 'block',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', width: 56, height: 56 }}>
                <ProductsIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Total Products
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {totalProducts}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Customers */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            component={Link}
            to="/admin/customers"
            elevation={2}
            sx={{
              height: '100%',
              display: 'block',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText', width: 56, height: 56 }}>
                <CustomersIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Active Customers
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {totalCustomers}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory & Order Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon color="primary" /> Inventory Summary
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Total Stock Units</Typography>
                  <Typography variant="h5" fontWeight="bold">{totalInventory}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Out of Stock</Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">{outOfStockCount}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Low Stock Items</Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">{lowStockCount}</Typography>
                </Grid>
              </Grid>

              {outOfStockCount > 0 && (
                <Alert severity="error" icon={<ErrorIcon />} sx={{ mt: 2 }}>
                  {outOfStockCount} item(s) are completely out of stock!
                </Alert>
              )}
              {lowStockCount > 0 && outOfStockCount === 0 && (
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                  {lowStockCount} item(s) are running below the stock threshold.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Breakdown */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Order Queue Segmentations
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Pending</Typography>
                  <Chip size="small" label={orderStats.pending || 0} color="default" sx={{ fontWeight: 'bold' }} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Processing</Typography>
                  <Chip size="small" label={orderStats.processing || 0} color="warning" sx={{ fontWeight: 'bold' }} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Shipped</Typography>
                  <Chip size="small" label={orderStats.shipped || 0} color="info" sx={{ fontWeight: 'bold' }} />
                </Grid>
                <Grid size={{ xs: 4 }} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Delivered</Typography>
                  <Chip size="small" label={orderStats.delivered || 0} color="success" sx={{ fontWeight: 'bold' }} />
                </Grid>
                <Grid size={{ xs: 4 }} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">Cancelled</Typography>
                  <Chip size="small" label={orderStats.cancelled || 0} color="error" sx={{ fontWeight: 'bold' }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Transactions
            </Typography>
            <Button component={Link} to="/admin/orders" size="small" variant="contained">
              View All Orders
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {recentOrders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
              No transactions logged yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{order._id}</TableCell>
                      <TableCell>
                        {order.user ? (
                          <>
                            <Typography variant="body2" fontWeight="bold">{order.user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.user.email}</Typography>
                          </>
                        ) : (
                          'Guest / Deleted Account'
                        )}
                      </TableCell>
                      <TableCell>{moment(order.createdAt).format('lll')}</TableCell>
                      <TableCell fontWeight="bold">${order.amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          to={`/order/invoice/${order._id}`}
                          variant="outlined"
                          size="small"
                        >
                          View Bill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Stock Alerts Grid */}
      <Grid container spacing={3}>
        {/* Out of Stock Alert Table */}
        {outOfStockProducts.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={2} sx={{ borderColor: 'error.main', borderStyle: 'solid', borderWidth: '1px' }}>
              <CardContent>
                <Typography variant="h6" color="error" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ErrorIcon /> Out of Stock Warning
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Sold</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {outOfStockProducts.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell fontWeight="medium">{p.name}</TableCell>
                          <TableCell>{p.sku || 'N/A'}</TableCell>
                          <TableCell align="right">{p.sold || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Low Stock Alert Table */}
        {lowStockProducts.length > 0 && (
          <Grid size={{ xs: 12, md: outOfStockProducts.length > 0 ? 6 : 12 }}>
            <Card elevation={2} sx={{ borderColor: 'warning.main', borderStyle: 'solid', borderWidth: '1px' }}>
              <CardContent>
                <Typography variant="h6" color="warning.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon /> Low Stock Threshold Alerts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Available Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockProducts.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell fontWeight="medium">{p.name}</TableCell>
                          <TableCell>{p.sku || 'N/A'}</TableCell>
                          <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                            {p.quantity} left
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;
