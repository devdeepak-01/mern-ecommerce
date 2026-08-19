import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ShowImage from './ShowImage';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardM from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { addItem, updateItem, removeItem } from './cartHelpers';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StockBadge = ({ quantity, threshold = 5 }) => {
  if (quantity === 0) {
    return (
      <Chip
        label="Out of Stock"
        size="small"
        sx={{
          bgcolor: '#f8d7da',
          color: '#842029',
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 22,
          borderRadius: '4px',
        }}
      />
    );
  }
  if (quantity <= threshold) {
    return (
      <Chip
        label={`Only ${quantity} left`}
        size="small"
        sx={{
          bgcolor: '#FFF3CD',
          color: '#664d03',
          fontWeight: 600,
          fontSize: '0.7rem',
          height: 22,
          borderRadius: '4px',
        }}
      />
    );
  }
  return (
    <Chip
      label="In Stock"
      size="small"
      sx={{
        bgcolor: '#d1e7dd',
        color: '#0a3622',
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        borderRadius: '4px',
      }}
    />
  );
};

const Card = ({
  product,
  showViewProductButton = true,
  showAddToCartButton = true,
  cartUpdate = false,
  showRemoveProductButton = false,
  setRun = () => {},
}) => {
  const [count, setCount] = useState(product.count || 1);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const addToCart = () => {
    addItem(product, () => {
      setSnackbarMessage(`${product.name} added to cart!`);
      setOpenSnackbar(true);
      setRun((prev) => !prev);
    });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const handleChange = (productId) => (event) => {
    setRun((prev) => !prev);
    const val = event.target.value < 1 ? 1 : event.target.value;
    setCount(val);
    if (event.target.value >= 1) {
      updateItem(productId, event.target.value);
      setSnackbarMessage('Quantity updated!');
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <CardM
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
          transition: 'box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(15,23,42,0.1)',
            borderColor: '#c5ccd5',
          },
        }}
      >
        {/* Product Image */}
        <ShowImage item={product} url="product" />

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1.5, md: 2 },
            '&:last-child': { pb: 2 },
          }}
        >
          {/* Category label */}
          {product.category?.name && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.4px',
                mb: 0.25,
                display: 'block',
              }}
            >
              {product.category.name}
            </Typography>
          )}

          {/* Seller badge */}
          {product.user?.name && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.72rem',
                display: 'block',
                mb: 0.75,
              }}
            >
              By <span style={{ fontWeight: 600, color: 'inherit' }}>{product.user.name}</span>
            </Typography>
          )}

          {/* Product Name */}
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 500,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              lineHeight: 1.4,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'text.primary',
              flexGrow: 0,
            }}
          >
            {product.name}
          </Typography>

          {/* Price row */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                color: (theme) => (theme.palette.mode === 'dark' ? '#FF9900' : '#172033'),
                lineHeight: 1,
              }}
            >
              ${product.price}
            </Typography>
          </Box>

          {/* Stock badge */}
          <Box sx={{ mb: 1.5 }}>
            <StockBadge
              quantity={product.quantity}
              threshold={product.lowStockThreshold}
            />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Cart update quantity control */}
          {cartUpdate && (
            <Box sx={{ mb: 1.5 }}>
              <TextField
                type="number"
                label="Qty"
                size="small"
                variant="outlined"
                value={count}
                onChange={handleChange(product._id)}
                inputProps={{ min: 1, max: product.quantity }}
                sx={{ width: 80 }}
              />
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {showAddToCartButton && (
              <Button
                onClick={addToCart}
                variant="contained"
                fullWidth
                startIcon={<ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
                disabled={product.quantity < 1}
                sx={{
                  bgcolor: '#FF9900',
                  color: '#172033',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  py: 0.875,
                  border: '1px solid #e68a00',
                  '&:hover': { bgcolor: '#e68a00' },
                  '&.Mui-disabled': {
                    bgcolor: '#f5f5f5',
                    color: '#aaa',
                    border: '1px solid #e0e0e0',
                  },
                }}
              >
                {product.quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            )}

            {showViewProductButton && (
              <Button
                component={Link}
                to={`/product/${product._id}`}
                variant="outlined"
                fullWidth
                startIcon={<VisibilityIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.45)' : '#131921',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#ffffff' : '#131921',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  py: 0.875,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.06)'
                      : 'transparent',
                  '&:hover': {
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#FF9900' : '#131921',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#FF9900' : '#131921',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,153,0,0.1)'
                        : 'rgba(19,25,33,0.05)',
                  },
                }}
              >
                View Details
              </Button>
            )}

            {showRemoveProductButton && (
              <Button
                onClick={() => {
                  removeItem(product._id);
                  setRun((prev) => !prev);
                  setSnackbarMessage(`${product.name} removed.`);
                  setOpenSnackbar(true);
                }}
                variant="outlined"
                fullWidth
                color="error"
                startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  py: 0.875,
                }}
              >
                Remove
              </Button>
            )}
          </Box>
        </CardContent>
      </CardM>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Card;
