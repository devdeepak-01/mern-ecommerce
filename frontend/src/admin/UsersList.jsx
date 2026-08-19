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
  Chip,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Divider,
  Box,
  CircularProgress,
} from '@mui/material';
import moment from 'moment';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { getUsersList, updateUserRole, listOrders } from './apiAdmin';

const getRoleChip = (role) => {
  switch (role) {
    case 'superadmin':
      return <Chip label="SuperAdmin" color="secondary" size="small" sx={{ fontWeight: 700, bgcolor: '#6B21A8', color: '#fff' }} />;
    case 'admin':
      return <Chip label="Admin" color="primary" size="small" sx={{ fontWeight: 700 }} />;
    case 'seller':
      return <Chip label="Seller" size="small" sx={{ fontWeight: 700, bgcolor: '#ea580c', color: '#fff' }} />;
    case 'customer':
    default:
      return <Chip label="Customer" size="small" sx={{ fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569' }} />;
  }
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;
  const isSuperAdmin = user && user.role === 'superadmin';

  const loadData = useCallback(() => {
    if (!user?._id || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    Promise.all([
      getUsersList(user._id, token),
      listOrders(user._id, token)
    ])
      .then(([userData, orderData]) => {
        if (userData && userData.error) {
          setError(userData.error);
        } else {
          setUsers(Array.isArray(userData) ? userData : []);
        }

        if (orderData && orderData.error) {
          console.log('Error loading orders:', orderData.error);
        } else {
          setOrders(Array.isArray(orderData) ? orderData : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load customers. Try again.');
        setLoading(false);
      });
  }, [user._id, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = (targetUserId, newRole, targetUserName) => {
    if (!isSuperAdmin) {
      setError('Forbidden: Only SuperAdmin can assign or modify user roles.');
      return;
    }

    setError('');
    setSuccess('');

    if (targetUserId === user._id) {
      setError('Safety Precaution: You cannot modify your own administrative role.');
      return;
    }

    updateUserRole(user._id, token, targetUserId, newRole).then((data) => {
      if (data && data.error) {
        setError(data.error);
      } else {
        const roleLabels = {
          superadmin: 'SuperAdmin',
          admin: 'Admin',
          seller: 'Seller',
          customer: 'Customer',
        };
        const roleLabel = roleLabels[newRole] || newRole;
        setSuccess(`Successfully updated role of "${targetUserName}" to "${roleLabel}".`);
        loadData();
      }
    });
  };

  const getUserStats = (userId) => {
    const userOrders = orders.filter(
      (order) => order.user && (order.user._id === userId || order.user === userId)
    );
    const ordersCount = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => {
      if (order.status && order.status.toLowerCase() !== 'cancelled') {
        return sum + (order.amount || 0);
      }
      return sum;
    }, 0);

    return { ordersCount, totalSpent };
  };

  return (
    <AdminLayout title="Customers & User Accounts">
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {isSuperAdmin
            ? 'Full User Governance: Inspect accounts, order frequencies, and assign platform roles.'
            : 'View registered customer and seller accounts, order frequencies, and spending metrics.'}
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
            Account Log ({users.length} {isSuperAdmin ? 'Total Accounts' : 'Visible Accounts'})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
                Loading accounts...
              </Typography>
            </Box>
          ) : users.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No accounts found.
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Joined Date</TableCell>
                    <TableCell align="center">Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell>Current Role</TableCell>
                    {isSuperAdmin && <TableCell align="right">Modify Authority</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => {
                    const { ordersCount, totalSpent } = getUserStats(u._id);
                    return (
                      <TableRow key={u._id} hover>
                        <TableCell sx={{ fontWeight: 'bold' }}>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{moment(u.createdAt).format('LL')}</TableCell>
                        <TableCell align="center">{ordersCount}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          ${totalSpent.toFixed(2)}
                        </TableCell>
                        <TableCell>{getRoleChip(u.role)}</TableCell>
                        {isSuperAdmin && (
                          <TableCell align="right">
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                              <Select
                                value={u.role || 'customer'}
                                onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                                disabled={u._id === user._id}
                                sx={{ fontSize: '0.8125rem' }}
                              >
                                <MenuItem value="customer">Customer</MenuItem>
                                <MenuItem value="seller">Seller</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="superadmin">SuperAdmin</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                        )}
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

export default UsersList;
