import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as PaidIcon,
  Cancel as CancelledIcon,
  Description as TotalIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import moment from 'moment';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { listOrders } from './apiAdmin';
import { Link } from 'react-router-dom';

const ManageBilling = () => {
  const auth = isAuthenticated() || {};
  const user = auth.user || {};
  const token = auth.token;
  const userId = user._id;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadOrders = useCallback(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    listOrders(userId, token)
      .then((data) => {
        if (!data) {
          setError('Unable to load billing data. Please check your network or server connection.');
          setOrders([]);
        } else if (data.error) {
          setError(data.error);
          setOrders([]);
        } else if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching billing orders:', err);
        setError('An unexpected error occurred while loading billing records.');
        setOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getPaymentStatus = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('cancelled')) return 'Cancelled';
    if (s.includes('refunded')) return 'Refunded';
    return 'Paid';
  };

  const getPaymentStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('cancelled')) return 'error';
    if (s.includes('refunded')) return 'warning';
    return 'success';
  };

  // Metrics calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => !String(o.status || '').toLowerCase().includes('cancelled') && !String(o.status || '').toLowerCase().includes('refunded'))
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  }, [orders]);

  const paidCount = useMemo(() => {
    return orders.filter((o) => getPaymentStatus(o.status) === 'Paid').length;
  }, [orders]);

  const cancelledCount = useMemo(() => {
    return orders.filter((o) => getPaymentStatus(o.status) !== 'Paid').length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderIdStr = String(order._id || '').toLowerCase();
      const invoiceStr = order._id ? `inv-${order._id.slice(-6)}`.toLowerCase() : '';
      const customerName = String(order.user?.name || '').toLowerCase();
      const customerEmail = String(order.user?.email || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        orderIdStr.includes(query) ||
        invoiceStr.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query);

      const paymentStatus = getPaymentStatus(order.status);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PAID' && paymentStatus === 'Paid') ||
        (statusFilter === 'CANCELLED' && paymentStatus !== 'Paid');

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <AdminLayout title="Billing & Invoices">
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
            Billing & Invoices Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Audit customer payments, download receipts, and track settled transaction balances
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          size="small"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Ledger'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Settled Revenue */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Avatar sx={{ bgcolor: 'success.light', color: 'success.contrastText', width: 48, height: 48 }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Settled Revenue
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  ${totalRevenue.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

       
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 48, height: 48 }}>
                <TotalIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Total Invoices
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {orders.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Paid / Completed */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText', width: 48, height: 48 }}>
                <PaidIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Paid Transactions
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {paidCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cancelled / Refunded */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={1} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Avatar sx={{ bgcolor: 'error.light', color: 'error.contrastText', width: 48, height: 48 }}>
                <CancelledIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Cancelled / Refunded
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {cancelledCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Ledger Card */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Filter and Search Controls */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by Invoice #, Order ID, or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 340 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="payment-status-filter-label">Payment Status</InputLabel>
              <Select
                labelId="payment-status-filter-label"
                value={statusFilter}
                label="Payment Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Statuses ({orders.length})</MenuItem>
                <MenuItem value="PAID">Paid ({paidCount})</MenuItem>
                <MenuItem value="CANCELLED">Cancelled / Refunded ({cancelledCount})</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Content States */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={44} sx={{ color: 'primary.main', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading billing ledger...
              </Typography>
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <InvoiceIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                {orders.length === 0 ? 'No Invoices Found' : 'No Matching Invoices'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto' }}>
                {orders.length === 0
                  ? 'No transaction records or orders have been registered in the system yet.'
                  : 'No invoices matched your current search filters. Try clearing your search keyword.'}
              </Typography>
              {(searchQuery || statusFilter !== 'ALL') && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <Table size="medium">
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((o) => {
                    const invoiceNum = o._id ? `INV-${o._id.slice(-6).toUpperCase()}` : 'INV-N/A';
                    const amountValue = Number(o.amount || 0);
                    const customerName = o.user?.name || (typeof o.user === 'string' ? `User ID: ${o.user.slice(-6)}` : 'Guest Customer');
                    const customerEmail = o.user?.email || 'N/A';
                    const orderDate = o.createdAt || o.created;

                    return (
                      <TableRow key={o._id || Math.random()} hover>
                        <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'primary.main' }}>
                          {invoiceNum}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
                          {o._id ? `${o._id.substring(0, 10)}...` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 'bold' }}>
                              {customerName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                {customerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                                {customerEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          {orderDate ? moment(orderDate).format('MMM DD, YYYY') : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                          ${amountValue.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentStatus(o.status)}
                            color={getPaymentStatusColor(o.status)}
                            size="small"
                            sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Detailed Invoice & Print">
                            <Button
                              component={Link}
                              to={`/order/invoice/${o._id}`}
                              variant="outlined"
                              size="small"
                              startIcon={<OpenIcon sx={{ fontSize: '1rem' }} />}
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                              View Bill
                            </Button>
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

export default ManageBilling;
