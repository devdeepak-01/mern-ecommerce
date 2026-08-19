import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import {
  getUsersList,
  createUser,
  updateUserDetails,
  deleteUser,
  getRoles,
} from './apiAdmin';
import moment from 'moment';

const ManageSuperUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Create User Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });

  // Edit User Dialog
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const auth = isAuthenticated() || {};
  const { user: currentAuthUser = {}, token = '' } = auth;

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getUsersList(currentAuthUser._id, token),
      getRoles(currentAuthUser._id, token),
    ])
      .then(([usersData, rolesData]) => {
        if (usersData.error) {
          setError(usersData.error);
        } else {
          setUsers(usersData);
        }

        if (rolesData.error) {
          setError(rolesData.error);
        } else {
          setRoles(rolesData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to retrieve user accounts.');
        setLoading(false);
      });
  }, [currentAuthUser._id, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create User
  const handleOpenCreate = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'customer',
    });
    setOpenCreateDialog(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Name, email, and password are required.');
      return;
    }

    createUser(currentAuthUser._id, token, newUser).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`User account for '${data.name}' was created successfully!`);
        setOpenCreateDialog(false);
        loadData();
      }
    });
  };

  // Edit User
  const handleOpenEdit = (targetUser) => {
    setEditingUser({
      ...targetUser,
      isActive: targetUser.isActive !== false,
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserDetails(currentAuthUser._id, token, editingUser._id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      isActive: editingUser.isActive,
    }).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`User '${editingUser.name}' was updated successfully!`);
        setOpenEditDialog(false);
        loadData();
      }
    });
  };

  // Delete User
  const handleDeleteUser = (targetUser) => {
    if (targetUser._id === currentAuthUser._id) {
      setError('You cannot delete your currently active account.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to permanently delete user account '${targetUser.name}' (${targetUser.email})?`
      )
    ) {
      deleteUser(currentAuthUser._id, token, targetUser._id).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.message || 'User deleted successfully.');
          loadData();
        }
      });
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === 'ALL' || (u.role || '').toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleName) => {
    const clean = (roleName || '').toLowerCase();
    if (clean === 'superadmin') {
      return (
        <Chip
          icon={<ShieldIcon fontSize="small" />}
          label="SuperAdmin"
          color="error"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      );
    }
    if (clean === 'admin') {
      return (
        <Chip
          icon={<AdminIcon fontSize="small" />}
          label="Admin"
          color="primary"
          size="small"
          sx={{ fontWeight: 'bold' }}
        />
      );
    }
    if (clean === 'seller') {
      return (
        <Chip
          icon={<PersonIcon fontSize="small" />}
          label="Seller"
          size="small"
          sx={{ fontWeight: 'bold', bgcolor: '#ea580c', color: '#fff' }}
        />
      );
    }
    return (
      <Chip
        icon={<PersonIcon fontSize="small" />}
        label={roleName || 'Customer'}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <AdminLayout title="SuperAdmin User Management">
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            All System User Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage administrative access, customers, role assignments, and active account states.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Create User Account
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

      {/* Filter and Search Bar */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="filter-role-label">Filter by Role</InputLabel>
              <Select
                labelId="filter-role-label"
                value={filterRole}
                label="Filter by Role"
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="superadmin">SuperAdmin</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                {roles
                  .filter((r) => !['superadmin', 'admin', 'seller', 'customer'].includes(r.name))
                  .map((r) => (
                    <MenuItem key={r.name} value={r.name}>
                      {r.displayName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            User Accounts ({filteredUsers.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Assigned Role</TableCell>
                    <TableCell>Account Status</TableCell>
                    <TableCell>Registered Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u._id} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.isActive !== false ? 'Active' : 'Deactivated'}
                          color={u.isActive !== false ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{moment(u.createdAt).format('LL')}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User & Permissions">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(u)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(u)}
                            size="small"
                            disabled={u._id === currentAuthUser._id}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
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

      {/* CREATE USER DIALOG */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Account</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="new-user-role-label">Role Assignment</InputLabel>
              <Select
                labelId="new-user-role-label"
                value={newUser.role}
                label="Role Assignment *"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="admin">Store Admin</MenuItem>
                <MenuItem value="superadmin">SuperAdmin</MenuItem>
                {roles
                  .filter((r) => !['superadmin', 'admin', 'seller', 'customer'].includes(r.name))
                  .map((r) => (
                    <MenuItem key={r.name} value={r.name}>
                      {r.displayName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateSubmit}>
            Create Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT USER DIALOG */}
      {editingUser && (
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Modify Account: {editingUser.name}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, my: 1 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                required
              />
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                required
              />
              <FormControl fullWidth required>
                <InputLabel id="edit-user-role-label">Role Assignment</InputLabel>
                <Select
                  labelId="edit-user-role-label"
                  value={editingUser.role}
                  label="Role Assignment *"
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="admin">Store Admin</MenuItem>
                  <MenuItem value="superadmin">SuperAdmin</MenuItem>
                  {roles
                    .filter(
                      (r) => !['superadmin', 'admin', 'seller', 'customer'].includes(r.name)
                    )
                    .map((r) => (
                      <MenuItem key={r.name} value={r.name}>
                        {r.displayName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={editingUser.isActive}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isActive: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  editingUser.isActive
                    ? 'Account is Active'
                    : 'Account is Deactivated (Blocked from Signin)'
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleEditSubmit}>
              Save User Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default ManageSuperUsers;
