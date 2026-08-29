import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Typography,
} from '@mui/material';
import AdminLayout from '../components/AdminLayout';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { createProduct, getCategories } from './apiAdmin';

const AddProduct = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: '',
    description: '',
    price: '',
    categories: [],
    category: '',
    shipping: '',
    quantity: '',
    sku: '',
    lowStockThreshold: '5',
    imageUrl: '',
    photo: null,
    loading: false,
    error: '',
    createdProduct: '',
    formData: new FormData(),
  });

  const [touched, setTouched] = useState({
    name: false,
    description: false,
    price: false,
    category: false,
    shipping: false,
    quantity: false,
  });

  const auth = isAuthenticated() || {};
  const { user = {}, token = '' } = auth;

  const {
    name,
    description,
    price,
    categories,
    category,
    shipping,
    quantity,
    sku,
    lowStockThreshold,
    imageUrl,
    loading,
    error,
    createdProduct,
    formData,
  } = values;

  // Form validation
  const validate = () => {
    return (
      name.trim() !== '' &&
      description.trim() !== '' &&
      Number(price) > 0 &&
      category !== '' &&
      shipping !== '' &&
      Number(quantity) >= 0
    );
  };

  const isFormValid = validate();

  const init = () => {
    getCategories().then((data) => {
      if (data.error) {
        setValues((v) => ({ ...v, error: data.error }));
      } else {
        setValues((v) => ({
          ...v,
          categories: data,
        }));
      }
    });
  };

  useEffect(() => {
    init();
  }, []);

  const handleChange = (name) => (event) => {
    const value = name === 'photo' ? event.target.files[0] : event.target.value;

    
    const newFormData = new FormData();
    for (let [key, val] of formData.entries()) {
      if (key !== name) {
        newFormData.set(key, val);
      }
    }
    if (value !== undefined && value !== null) {
      newFormData.set(name, value);
    }

    setValues((v) => ({
      ...v,
      [name]: value,
      formData: newFormData,
      error: '',
    }));

    // Mark field as touched
    setTouched((t) => ({ ...t, [name]: true }));
  };


  const handleBlur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const clickSubmit = (event) => {
    event.preventDefault();
    setValues((v) => ({ ...v, error: '', loading: true }));

    createProduct(user._id, token, formData).then((data) => {
      if (data.error) {
        setValues((v) => ({ ...v, error: data.error, loading: false }));
      } else {
        setValues({
          name: '',
          description: '',
          price: '',
          quantity: '',
          sku: '',
          lowStockThreshold: '5',
          imageUrl: '',
          photo: null,
          shipping: '',
          category: '',
          categories,
          loading: false,
          createdProduct: data.name,
          error: '',
          formData: new FormData(),
        });
        setTouched({
          name: false,
          description: false,
          price: false,
          category: false,
          shipping: false,
          quantity: false,
        });
      }
    });
  };


  const showError = () => (
    <Alert severity="error" sx={{ mb: 3, display: error ? '' : 'none' }} onClose={() => setValues((v) => ({ ...v, error: '' }))}>
      {error}
    </Alert>
  );

  const showSuccess = () => (
    <Alert
      severity="success"
      sx={{ mb: 3, display: createdProduct ? '' : 'none' }}
      action={
        <Button color="inherit" size="small" onClick={() => navigate('/admin/products')}>
          View Inventory
        </Button>
      }
    >
      Product "{createdProduct}" was created successfully!
    </Alert>
  );

  const showLoading = () => (
    <Box sx={{ display: loading ? 'flex' : 'none', justifyContent: 'center', my: 2 }}>
      <CircularProgress />
    </Box>
  );

  const newPostForm = () => (
    <Box component="form" onSubmit={clickSubmit} sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Image Handling Options */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            label="Image URL (Direct Internet URL or /images/filename.jpg)"
            variant="outlined"
            fullWidth
            value={imageUrl}
            onChange={handleChange('imageUrl')}
            placeholder="e.g. https://example.com/product.jpg or /images/sony-4k-tv.jpg"
            helperText="Provide an internet URL or local path, or upload a file below"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ py: 1.8 }}
          >
            Upload Photo File
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
              File selected: {formData.get('photo').name}
            </Typography>
          )}
        </Grid>

        {/* Live Preview if image URL exists */}
        {imageUrl && imageUrl.trim() !== '' && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 1, border: '1px dashed #cbd5e1', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src={imageUrl.trim()}
                alt="Preview"
                onError={(e) => { e.currentTarget.src = '/images/image-placeholder.svg'; }}
                style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 4, background: '#f8fafc' }}
              />
              <Typography variant="caption" color="text.secondary">
                Image Preview: {imageUrl}
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
            onBlur={handleBlur('name')}
            error={touched.name && name.trim() === ''}
            helperText={touched.name && name.trim() === '' ? 'Product name is required' : ''}
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
            onBlur={handleBlur('description')}
            error={touched.description && description.trim() === ''}
            helperText={touched.description && description.trim() === '' ? 'Description is required' : ''}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Price ($)"
            type="number"
            variant="outlined"
            fullWidth
            value={price}
            onChange={handleChange('price')}
            onBlur={handleBlur('price')}
            error={touched.price && Number(price) <= 0}
            helperText={touched.price && Number(price) <= 0 ? 'Price must be greater than 0' : ''}
            inputProps={{ min: '0.01', step: '0.01' }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Initial Stock Quantity"
            type="number"
            variant="outlined"
            fullWidth
            value={quantity}
            onChange={handleChange('quantity')}
            onBlur={handleBlur('quantity')}
            error={touched.quantity && Number(quantity) < 0}
            helperText={touched.quantity && Number(quantity) < 0 ? 'Quantity must be 0 or more' : ''}
            inputProps={{ min: '0' }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Low Stock Warning Limit"
            type="number"
            variant="outlined"
            fullWidth
            value={lowStockThreshold}
            onChange={handleChange('lowStockThreshold')}
            helperText="Alert when stock falls to this count"
            inputProps={{ min: '1' }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required error={touched.category && category === ''}>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              label="Category *"
              onChange={handleChange('category')}
              onBlur={handleBlur('category')}
            >
              <MenuItem value="">
                <em>Select a Category</em>
              </MenuItem>
              {categories &&
                categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name}
                  </MenuItem>
                ))}
            </Select>
            {touched.category && category === '' && (
              <FormHelperText>Category is required</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required error={touched.shipping && shipping === ''}>
            <InputLabel id="shipping-select-label">Shipping Available</InputLabel>
            <Select
              labelId="shipping-select-label"
              value={shipping}
              label="Shipping Available *"
              onChange={handleChange('shipping')}
              onBlur={handleBlur('shipping')}
            >
              <MenuItem value="">
                <em>Select Option</em>
              </MenuItem>
              <MenuItem value="1">Yes (Eligible for delivery)</MenuItem>
              <MenuItem value="0">No (Digital or In-store Pickup)</MenuItem>
            </Select>
            {touched.shipping && shipping === '' && (
              <FormHelperText>Shipping selection is required</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={!isFormValid || loading}
            sx={{ py: 1.5, mt: 1 }}
          >
            {loading ? 'Creating Product...' : 'Publish Product to Store'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <AdminLayout title="Add New Product">
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Create Product Listing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill out the details below to add a new inventory item to the Cara catalog.
          </Typography>
          <Divider sx={{ mb: 4 }} />

          {showLoading()}
          {showSuccess()}
          {showError()}
          {newPostForm()}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};



export default AddProduct;
