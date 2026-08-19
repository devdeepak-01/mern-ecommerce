import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Avatar,
  Button,
  Container,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Receipt as InvoiceIcon, ShoppingBag } from '@mui/icons-material';
import { isAuthenticated } from '../auth';
import { getPurchaseHistory } from './apiUser';
import moment from 'moment';
import Layout from '../core/Layout';
import UserSidebar from '../components/UserSidebar';
import Footer from '../core/Footer';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = isAuthenticated() || {};
  const user = auth.user || {};
  const { _id, name = '', email = '', role = '' } = user;
  const token = auth.token;

  useEffect(() => {
    if (_id && token) {
      getPurchaseHistory(_id, token).then((data) => {
        if (data && !data.error && Array.isArray(data)) setHistory(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [_id, token]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'success';
    if (s.includes('shipped')) return 'info';
    if (s.includes('processing')) return 'warning';
    if (s.includes('cancelled')) return 'error';
    return 'default';
  };

  const getPaymentStatusChip = (paid) => (
    <Chip
      label={paid ? 'Paid' : 'Pending'}
      size="small"
      sx={{
        bgcolor: paid ? '#d1e7dd' : '#FFF3CD',
        color: paid ? '#0a3622' : '#664d03',
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        borderRadius: '4px',
      }}
    />
  );

  return (
    <>
      <Layout title={`Hello, ${name.split(' ')[0]}`} description="Welcome back to your account" showPageHeader>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Left Sidebar */}
            <UserSidebar userId={_id} />

            {/* Right: Main Content */}
            <Grid size={{ xs: 12, md: 9 }}>
              {/* Profile card */}
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: 'text.primary' }}>
                    My Profile
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#131921',
                        color: '#FF9900',
                        width: 52,
                        height: 52,
                        fontSize: '1.25rem',
                        fontWeight: 700,
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
                        {name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {email}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={role === 'admin' ? 'Admin' : 'Customer'}
                        size="small"
                        sx={{
                          bgcolor: role === 'admin' ? '#131921' : '#FFF3E0',
                          color: role === 'admin' ? '#FF9900' : '#CC7A00',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 0.75 }}>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.4px' }}>
                            User ID
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary', fontSize: '0.8rem' }}>
                            {_id}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      to={`/profile/${_id}`}
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <ShoppingBag sx={{ color: '#FF9900', fontSize: 22 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Order History
                    </Typography>
                    {!loading && (
                      <Chip
                        label={`${history.length} orders`}
                        size="small"
                        sx={{ bgcolor: 'action.hover', fontWeight: 600, fontSize: '0.75rem', ml: 'auto' }}
                      />
                    )}
                  </Box>

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                      <CircularProgress size={36} sx={{ color: '#FF9900' }} />
                    </Box>
                  ) : history.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 5,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <ShoppingBag sx={{ fontSize: 48, color: '#E1E5EA', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No orders yet
                      </Typography>
                      <Button
                        component={Link}
                        to="/shop"
                        variant="contained"
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: '#FF9900',
                          color: '#172033',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#e68a00' },
                        }}
                      >
                        Start Shopping
                      </Button>
                    </Box>
                  ) : (
                    <List sx={{ py: 0 }}>
                      {history.map((order, i) => (
                        <Paper
                          key={order._id || i}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            mb: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                          }}
                        >
                          {/* Order header */}
                          <Grid container spacing={2} sx={{ mb: 1.5 }} alignItems="center" justifyContent="space-between">
                            <Grid>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                Order ID
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary', fontSize: '0.8rem' }}>
                                {order._id?.substring(0, 16)}...
                              </Typography>
                            </Grid>
                            <Grid>
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', display: 'block', fontSize: '0.7rem' }}>
                                {moment(order.createdAt).format('DD MMM YYYY')}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25, justifyContent: 'flex-end' }}>
                                {getPaymentStatusChip(order.transaction_id)}
                                <Chip
                                  label={order.status || 'Pending'}
                                  color={getStatusColor(order.status)}
                                  size="small"
                                  sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22, borderRadius: '4px' }}
                                />
                              </Box>
                            </Grid>
                          </Grid>

                          <Divider sx={{ mb: 1.5 }} />

                          {/* Products */}
                          <Box sx={{ mb: 1.5 }}>
                            {order.products.map((p, j) => (
                              <Box
                                key={j}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 0.5,
                                }}
                              >
                                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                  {p.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {p.count}x · ${p.price?.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          <Divider sx={{ mb: 1.5 }} />

                          {/* Footer row */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              Total: ${order.amount?.toFixed(2) || '0.00'}
                            </Typography>
                            <Button
                              component={Link}
                              to={`/order/invoice/${order._id}`}
                              variant="outlined"
                              size="small"
                              startIcon={<InvoiceIcon sx={{ fontSize: '0.9rem' }} />}
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            >
                              Invoice
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Layout>
      <Footer />
    </>
  );
};

export default Dashboard;
