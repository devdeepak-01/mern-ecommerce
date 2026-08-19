import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Print as PrintIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { getOrder } from './apiCore';
import { isAuthenticated, isAuthenticatedAdmin } from '../auth';
import moment from 'moment';

const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const auth = isAuthenticated() || isAuthenticatedAdmin();
  const user = auth ? auth.user : null;
  const token = auth ? auth.token : null;
  const userId = user ? user._id : null;

  useEffect(() => {
    if (orderId && userId && token) {
      setLoading(true);
      setError('');
      getOrder(orderId, userId, token)
        .then((data) => {
          if (!data || data.error) {
            setError(data?.error || 'Unable to retrieve invoice data.');
          } else {
            setOrder(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch invoice:', err);
          setError('Failed to connect to server to fetch invoice.');
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('You must be signed in to view invoices.');
    }
  }, [orderId, userId, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<BackIcon />} sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Order invoice could not be located.</Alert>
        <Button startIcon={<BackIcon />} sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  // Calculate values
  const items = order.products || [];
  const subtotal = items.reduce((sum, item) => sum + (item.count * item.price), 0);
  const shipping = 0.00; // Default Free Shipping
  const tax = 0.00; // Default 0% Tax unless otherwise specified
  const total = order.amount || subtotal;

  const invoiceNumber = `INV-${order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}`;

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      {/* Action Buttons (Hidden during Print) */}
      <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button startIcon={<BackIcon />} variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button startIcon={<PrintIcon />} variant="contained" onClick={handlePrint}>
          Print Invoice / Save PDF
        </Button>
      </Box>

      {/* CSS style to hide navbar and buttons during print */}
      <style>
        {`
          @media print {
            body {
              background-color: #ffffff !important;
              color: #000000 !important;
            }
            .no-print {
              display: none !important;
            }
            .MuiPaper-root {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
            }
            header, footer, nav {
              display: none !important;
            }
          }
        `}
      </style>

      <Paper elevation={3} sx={{ p: 5, border: '1px solid rgba(0,0,0,0.08)' }}>
        {/* Invoice Header */}
        <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Playfair Display", "Outfit", serif',
                fontWeight: 800,
                color: 'primary.main',
                letterSpacing: '1px',
              }}
            >
              Cara
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Boutique E-Commerce Store
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              123 Fashion Blvd, Suite 100
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              support@cara.com | +1 (555) 019-9000
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              RETAIL INVOICE
            </Typography>
            <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 'bold', mt: 1 }}>
              {invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Date: {moment(order.createdAt).format('MMMM DD, YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment Method: Card Sandbox
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Customer & Transaction Meta */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
              BILL TO:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {order.user?.name || 'Customer'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {order.user?.email || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
              <strong>Delivery Address:</strong><br />
              {order.address}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
              ORDER REFERENCE:
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Order ID:</strong> {order._id}
            </Typography>
            <Typography variant="body2">
              <strong>Transaction ID:</strong> {order.transaction_id || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Order Status:</strong> {order.status}
            </Typography>
          </Grid>
        </Grid>

        {/* Products Table */}
        <TableContainer component={Box} sx={{ mb: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Description / Item</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Line Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                    {item.product?.sku && (
                      <Typography variant="caption" color="text.secondary">SKU: {item.product.sku}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.count}</TableCell>
                  <TableCell align="right" fontWeight="bold">
                    ${(item.count * item.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pricing Summary */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5, pr: 2 }}>
          <Box sx={{ display: 'flex', width: 250, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
            <Typography variant="body2" fontWeight="medium">${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', width: 250, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Tax (0%):</Typography>
            <Typography variant="body2" fontWeight="medium">${tax.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', width: 250, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Shipping Charge:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </Typography>
          </Box>
          <Divider sx={{ width: 250, my: 1 }} />
          <Box sx={{ display: 'flex', width: 250, justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight="bold">Total charged:</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
              ${total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Terms Footer */}
        <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Thank you for shopping with Cara!
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            If you have any questions concerning this invoice, contact our support team.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Invoice;
