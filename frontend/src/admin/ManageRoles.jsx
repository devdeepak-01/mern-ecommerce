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
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  updateRolePermissions,
} from './apiAdmin';

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog state for Creating Role
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
  });

  // Dialog state for Editing Role & Permissions
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const loadData = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([getRoles(user._id, token), getPermissions(user._id, token)])
      .then(([rolesData, permsData]) => {
        if (rolesData.error) {
          setError(rolesData.error);
        } else {
          setRoles(rolesData);
        }

        if (permsData.error) {
          setError(permsData.error);
        } else {
          setPermissions(permsData);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load roles and permissions.');
        setLoading(false);
      });
  }, [user._id, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    const mod = perm.module || 'Other';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  // Handle Create Role
  const handleOpenCreate = () => {
    setNewRole({
      name: '',
      displayName: '',
      description: '',
      permissions: [],
    });
    setOpenCreateDialog(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newRole.name.trim() || !newRole.displayName.trim()) {
      setError('Role Identifier and Display Name are required.');
      return;
    }

    createRole(user._id, token, newRole).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Role '${data.displayName}' created successfully!`);
        setOpenCreateDialog(false);
        loadData();
      }
    });
  };

  // Handle Edit Role
  const handleOpenEdit = (role) => {
    setEditingRole({
      ...role,
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingRole) return;

    updateRole(user._id, token, editingRole._id, {
      displayName: editingRole.displayName,
      description: editingRole.description,
      permissions: editingRole.permissions,
    }).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(`Role '${editingRole.displayName}' updated successfully!`);
        setOpenEditDialog(false);
        loadData();
      }
    });
  };

  // Toggle permission for editing role
  const handleTogglePermission = (permKey) => {
    if (!editingRole) return;
    const current = editingRole.permissions || [];
    const exists = current.includes(permKey);
    const updated = exists
      ? current.filter((k) => k !== permKey)
      : [...current, permKey];
    setEditingRole({ ...editingRole, permissions: updated });
  };

  // Toggle permission for new role
  const handleToggleNewRolePermission = (permKey) => {
    const current = newRole.permissions || [];
    const exists = current.includes(permKey);
    const updated = exists
      ? current.filter((k) => k !== permKey)
      : [...current, permKey];
    setNewRole({ ...newRole, permissions: updated });
  };

  // Handle Delete Role
  const handleDeleteRole = (role) => {
    if (role.isSystem) {
      setError('System roles cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete role '${role.displayName}'?`)) {
      deleteRole(user._id, token, role._id).then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.message || 'Role deleted successfully.');
          loadData();
        }
      });
    }
  };

  return (
    <AdminLayout title="Role & Permission Governance">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Role-Based Access Control (RBAC)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure system roles, granular permissions, and authorization boundaries.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Create Custom Role
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
            Configured Roles ({roles.length})
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
                    <TableCell>Role Identifier</TableCell>
                    <TableCell>Display Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Active Permissions</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role._id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {role.name}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {role.name === 'superadmin' ? (
                            <ShieldIcon color="error" fontSize="small" />
                          ) : (
                            <SecurityIcon color="primary" fontSize="small" />
                          )}
                          {role.displayName}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', maxWidth: 280 }}>
                        {role.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            role.name === 'superadmin'
                              ? 'All System Permissions (*)'
                              : `${(role.permissions || []).length} permissions assigned`
                          }
                          color={role.name === 'superadmin' ? 'error' : 'primary'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.isSystem ? 'System Core' : 'Custom'}
                          color={role.isSystem ? 'default' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Configure Role & Permissions">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEdit(role)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!role.isSystem && (
                          <Tooltip title="Delete Custom Role">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteRole(role)}
                              size="small"
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* CREATE ROLE DIALOG */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Create New Custom Role
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, my: 1 }}>
            <TextField
              label="Role Identifier (e.g. support_manager)"
              fullWidth
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              placeholder="e.g. inventory_staff"
              helperText="Unique lowercase identifier without spaces"
              required
            />
            <TextField
              label="Display Name"
              fullWidth
              value={newRole.displayName}
              onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
              placeholder="e.g. Inventory Staff"
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              placeholder="Responsibilities and access scope of this role"
            />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
              Select Role Permissions:
            </Typography>

            {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
              <Accordion key={moduleName} defaultExpanded elevation={1}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">
                    {moduleName} Module ({perms.length} available)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {perms.map((p) => (
                      <Grid item xs={12} sm={6} key={p.key}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={(newRole.permissions || []).includes(p.key)}
                              onChange={() => handleToggleNewRolePermission(p.key)}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {p.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {p.key}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCreateSubmit}>
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT ROLE & PERMISSIONS DIALOG */}
      {editingRole && (
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Edit Role: {editingRole.displayName} ({editingRole.name})
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, my: 1 }}>
              <TextField
                label="Display Name"
                fullWidth
                value={editingRole.displayName}
                onChange={(e) =>
                  setEditingRole({ ...editingRole, displayName: e.target.value })
                }
                required
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={editingRole.description || ''}
                onChange={(e) =>
                  setEditingRole({ ...editingRole, description: e.target.value })
                }
              />

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                Role Permissions:
              </Typography>

              {editingRole.name === 'superadmin' ? (
                <Alert severity="info">
                  The SuperAdmin role automatically and unconditionally possesses all system permissions.
                </Alert>
              ) : (
                Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                  <Accordion key={moduleName} defaultExpanded elevation={1}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight="bold">
                        {moduleName} Module
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        {perms.map((p) => (
                          <Grid item xs={12} sm={6} key={p.key}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={(editingRole.permissions || []).includes(p.key)}
                                  onChange={() => handleTogglePermission(p.key)}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {p.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {p.key}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleEditSubmit}>
              Save Role Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default ManageRoles;
