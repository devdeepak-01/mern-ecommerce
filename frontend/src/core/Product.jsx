import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from './Layout';
import { read, listRelated } from './apiCore';
import Card from './Card';
import ShowImage from './ShowImage';
import { addItem } from './cartHelpers';
import Footer from './Footer';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SnackbarAlert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});

const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>";

const Product = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { productId } = useParams();

  const loadSingleProduct = (id) => {
    read(id).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProduct(data);
        setError('');
        listRelated(data._id).then((relatedData) => {
          if (relatedData.error) {
            setError(relatedData.error);
          } else {
            setRelatedProducts(relatedData);
          }
        });
      }
    });
  };

  useEffect(() => {
    loadSingleProduct(productId);
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, () => {
        setSnackbarMessage(`${product.name} added to cart!`);
        setOpenSnackbar(true);
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
    <Layout
      title={product?.name || 'Product Details'}
      description={product?.description?.substring(0, 100) || 'View product details and specifications'}
      className='container'
    >
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>

        <Button
          component={Link}
          to="/shop"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mb: 4, fontWeight: 'bold' }}
        >
          Back to Shop
        </Button>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {product ? (
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* Left: Product Image */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: '#F8F9FA',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 380,
                  maxHeight: 480,
                }}
              >
                <img
                  src={product.imageUrl || (product._id ? `/api/product/photo/${product._id}` : '/images/image-placeholder.svg')}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.src = '/images/image-placeholder.svg'; }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    padding: '8px',
                  }}
                />
              </Box>
            </Grid>

            {/* Right: Product Details */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant='h4' component='h1' fontWeight='bold' color='text.primary'>
                  {product.name}
                </Typography>
                
                <Typography variant='body2' color='text.secondary'>
                  Category: <span style={{ fontWeight: 'bold' }}>{product.category?.name}</span>
                </Typography>

                {product.user && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    >
                      {product.user.name ? product.user.name.charAt(0).toUpperCase() : 'S'}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, display: 'block', fontSize: '0.6875rem' }}>
                        Sold & Fulfilled by
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                        {product.user.name || 'Marketplace Seller'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant='h4' color='text.primary' fontWeight={700}>
                    ${product.price}
                  </Typography>
                  {product.quantity === 0 ? (
                    <Chip label="Out of Stock" sx={{ bgcolor: '#f8d7da', color: '#842029', fontWeight: 700 }} size="small" />
                  ) : product.quantity <= (product.lowStockThreshold || 5) ? (
                    <Chip label={`Only ${product.quantity} left!`} sx={{ bgcolor: '#FFF3CD', color: '#664d03', fontWeight: 700 }} size="small" />
                  ) : (
                    <Chip label="In Stock" sx={{ bgcolor: '#d1e7dd', color: '#0a3622', fontWeight: 700 }} size="small" />
                  )}
                </Box>

                <Typography variant='body1' sx={{ lineHeight: 1.6, color: 'text.primary', mt: 1 }}>
                  {product.description}
                </Typography>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    onClick={handleAddToCart}
                    variant='contained'
                    size='large'
                    startIcon={<ShoppingCartIcon />}
                    disabled={product.quantity < 1}
                    sx={{
                      bgcolor: '#FF9900',
                      color: '#172033',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      border: '1px solid #e68a00',
                      '&:hover': { bgcolor: '#e68a00' },
                      '&.Mui-disabled': { bgcolor: '#f5f5f5', color: '#aaa' },
                    }}
                  >
                    {product.quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    component={Link}
                    to="/cart"
                    variant='outlined'
                    color='primary'
                    size='large'
                    sx={{
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Go to Cart
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body1">Loading product details...</Typography>
        )}

        {/* Related Products Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom sx={{ mb: 3 }}>
            Related Products
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {relatedProducts.length > 0 ? (
              relatedProducts.map((p, i) => (
                <Card key={i} product={p} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No related products found.</Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <SnackbarAlert
          onClose={handleCloseSnackbar}
          severity='success'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </SnackbarAlert>
      </Snackbar>
    </Layout>
    <Footer />
    </>
  );
};

export default Product;
