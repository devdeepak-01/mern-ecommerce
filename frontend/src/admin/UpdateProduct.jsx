import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Box,
} from '@mui/material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { getProduct, getCategories, updateProduct } from './apiAdmin';

const UpdateProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    shipping: '',
    quantity: '',
    sku: '',
    lowStockThreshold: '5',
    imageUrl: '',
    isActive: true,
    photo: '',
    loading: false,
    error: '',
    createdProduct: '',
    formData: new FormData(),
  });
  
  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const {
    name,
    description,
    price,
    category,
    shipping,
    quantity,
    sku,
    lowStockThreshold,
    imageUrl,
    isActive,
    loading,
    error,
    createdProduct,
    formData,
  } = values;

  useEffect(() => {
    const initCategories = () => {
      getCategories().then((data) => {
        if (data.error) {
          setValues((v) => ({ ...v, error: data.error }));
        } else {
          setCategories(data);
        }
      });
    };

    const init = (id) => {
      getProduct(id).then((data) => {
        if (data.error) {
          setValues((v) => ({ ...v, error: data.error }));
        } else {
          const form = new FormData();
          form.set('name', data.name);
          form.set('description', data.description);
          form.set('price', data.price);
          form.set('category', data.category?._id || data.category);
          form.set('shipping', data.shipping ? '1' : '0');
          form.set('quantity', data.quantity);
          form.set('sku', data.sku || '');
          form.set('lowStockThreshold', data.lowStockThreshold || '5');
          form.set('imageUrl', data.imageUrl || '');
          form.set('isActive', data.isActive ? 'true' : 'false');

          setValues((v) => ({
            ...v,
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category?._id || data.category,
            shipping: data.shipping ? '1' : '0',
            quantity: data.quantity,
            sku: data.sku || '',
            lowStockThreshold: data.lowStockThreshold || '5',
            imageUrl: data.imageUrl || '',
            isActive: data.isActive !== false,
            formData: form,
          }));
          initCategories();
        }
      });
    };

    if (productId) {
      init(productId);
    }
  }, [productId]);

  const handleChange = (name) => (event) => {
    const value = name === 'photo' ? event.target.files[0] : event.target.value;
    
    // Update local state copy of formData
    const newFormData = new FormData();
    for (let [key, val] of formData.entries()) {
      if (key !== name) {
        newFormData.set(key, val);
      }
    }
    
    if (value !== undefined && value !== null) {
      if (name === 'isActive') {
        newFormData.set(name, value === 'true' ? 'true' : 'false');
      } else {
        newFormData.set(name, value);
      }
    }

    setValues((v) => ({
      ...v,
      [name]: name === 'isActive' ? (value === 'true') : value,
      formData: newFormData,
      error: '',
    }));
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues((v) => ({ ...v, error: '', loading: true }));

    updateProduct(productId, user._id, token, formData).then((data) => {
      if (data.error) {
        setValues((v) => ({ ...v, error: data.error, loading: false }));
      } else {
        setValues((v) => ({
          ...v,
          loading: false,
          error: '',
          createdProduct: data.name,
        }));
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      }
    });
  };

  const updateForm = () => (
    <Box component="form" onSubmit={clickSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Image Options */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            label="Image URL (Direct Internet URL or /images/filename.jpg)"
            variant="outlined"
            fullWidth
            value={imageUrl}
            onChange={handleChange('imageUrl')}
            placeholder="e.g. https://example.com/product.jpg or /images/sony-4k-tv.jpg"
            helperText="Update image URL or upload a new photo file below"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ py: 1.8 }}
          >
            Upload Replacement File
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange('photo')}
              hidden
            />
          </Button>
          {formData.get('photo') && typeof formData.get('photo') === 'object' && (
            <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5, textAlign: 'center' }}>
              New photo selected: {formData.get('photo').name}
            </Typography>
          )}
        </Grid>

        {/* Live Preview */}
        {(imageUrl || productId) && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 1, border: '1px dashed #cbd5e1', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src={imageUrl || `/api/product/photo/${productId}`}
                alt="Product Preview"
                onError={(e) => { e.currentTarget.src = '/images/image-placeholder.svg'; }}
                style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 4, background: '#f8fafc' }}
              />
              <Typography variant="caption" color="text.secondary">
                Current Image: {imageUrl || 'Stored product photo'}
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Product Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={handleChange('name')}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Product SKU / ID"
            variant="outlined"
            fullWidth
            value={sku}
            onChange={handleChange('sku')}
            placeholder="e.g. TS-100-MED"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={handleChange('description')}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Price ($)"
            variant="outlined"
            fullWidth
            type="number"
            value={price}
            onChange={handleChange('price')}
            required
            inputProps={{ min: 0.01, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category *</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              label="Category *"
              onChange={handleChange('category')}
            >
              {categories &&
                categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Stock Quantity"
            variant="outlined"
            fullWidth
            type="number"
            value={quantity}
            onChange={handleChange('quantity')}
            required
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Low Stock Threshold"
            variant="outlined"
            fullWidth
            type="number"
            value={lowStockThreshold}
            onChange={handleChange('lowStockThreshold')}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="active-status-label">Product Status</InputLabel>
            <Select
              labelId="active-status-label"
              value={isActive ? 'true' : 'false'}
              label="Product Status"
              onChange={handleChange('isActive')}
            >
              <MenuItem value="true">Active (Visible in Store)</MenuItem>
              <MenuItem value="false">Archived / Hidden</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel id="shipping-label">Shipping Option</InputLabel>
            <Select
              labelId="shipping-label"
              value={shipping}
              label="Shipping Option"
              onChange={handleChange('shipping')}
            >
              <MenuItem value="1">Yes (Eligible for delivery)</MenuItem>
              <MenuItem value="0">No (Digital or In-store Pickup)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ flexGrow: 1 }}
          >
            {loading ? 'Saving Changes...' : 'Save Product Updates'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const showError = () => (
    <Alert severity="error" sx={{ mb: 3, display: error ? '' : 'none' }} onClose={() => setValues((v) => ({ ...v, error: '' }))}>
      {error}
    </Alert>
  );

  const showSuccess = () => (
    <Alert severity="success" sx={{ mb: 3, display: createdProduct ? '' : 'none' }}>
      Product "{createdProduct}" was updated successfully! Redirecting to products...
    </Alert>
  );

  const showLoading = () => (
    <Box sx={{ display: loading ? 'flex' : 'none', justifyContent: 'center', my: 2 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <AdminLayout title="Update Product">
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Modify Inventory Product
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Edit product attributes, image source, stock parameters, or pricing below.
          </Typography>
          <Divider sx={{ mb: 4 }} />

          {showLoading()}
          {showSuccess()}
          {showError()}
          {updateForm()}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default UpdateProduct;
