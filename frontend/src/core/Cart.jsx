import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { getCart } from './cartHelpers.js';
import Card from './Card.jsx';
import Checkout from './Checkout';
import Footer from './Footer.jsx';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Button,
  Paper,
  Stack,
} from '@mui/material';


const Cart = () => {
  const [items, setItems] = useState([]);
  const [run, setRun] = useState(false);

  useEffect(() => {
    setItems(getCart());
  }, [run]);

  const showItems = (items) => (
    <Stack spacing={3}>
      <Typography variant='h5' textAlign='center' gutterBottom>
        Your Cart ({items.length} {items.length === 1 ? 'Item' : 'Items'})
      </Typography>
      <Divider />
      {items.map((product, i) => (
        <Box key={i}>
          <Card
            product={product}
            showAddToCartButton={false}
            cartUpdate={true}
            showRemoveProductButton={true}
            setRun={setRun}
            run={run}
          />
        </Box>
      ))}
    </Stack>
  );



  const noItemsMessage = () => (
    <Box textAlign='center' py={4}>
      <Typography variant='h5' gutterBottom>
        Your cart is empty
      </Typography>
      <Button
        component={Link}
        to='/shop'
        variant='contained'
        color='primary'
        size='large'
        sx={{ mt: 2 }}
      >
        Continue Shopping
      </Button>
    </Box>
  );


  return (
    <>
      <Layout title='Shopping Cart' description='Review your items before checkout' showPageHeader>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0, md: 1 }, py: 2 }}>
          {items.length > 0 ? (
            <Grid container spacing={3}>
              {/* Cart Items — wider column */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  {showItems(items)}
                </Paper>
              </Grid>

              {/* Order Summary */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    position: { md: 'sticky' },
                    top: { md: 80 },
                  }}
                >
                  <Typography variant='h6' fontWeight={700} gutterBottom>
                    Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Checkout products={items} setRun={setRun} run={run} />
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ maxWidth: 480, mx: 'auto' }}>
              <Paper
                elevation={0}
                sx={{ p: 5, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}
              >
                {noItemsMessage()}
              </Paper>
            </Box>
          )}
        </Box>
      </Layout>
      <Footer />
    </>
  );
};


export default Cart;
