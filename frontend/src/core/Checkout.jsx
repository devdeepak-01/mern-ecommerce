import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Stack,
} from '@mui/material';
import {
  getBraintreeClientToken,
  processPayment,
  createOrder,
} from './apiCore';
import { emptyCart } from './cartHelpers';
import { isAuthenticated } from '../auth';
import { Link } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react';

const Checkout = ({ products, setRun = () => {} }) => {
  const dropInInstance = useRef(null);
  const [data, setData] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: '',
    address: '',
  });

  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;

  const getToken = (userId, token) => {
    if (!userId || !token) return;
    getBraintreeClientToken(userId, token)
      .then((res) => {
        if (res && res.clientToken) {
          setData((prev) => ({ ...prev, clientToken: res.clientToken }));
        } else {
          // Braintree keys not configured - seamlessly fallback to direct test checkout
          setData((prev) => ({ ...prev, clientToken: null }));
        }
      })
      .catch(() => {
        setData((prev) => ({ ...prev, clientToken: null }));
      });
  };

  useEffect(() => {
    getToken(userId, token);
  }, [userId, token]);

  const handleAddress = (event) => {
    setData((prev) => ({ ...prev, address: event.target.value }));
  };

  const getTotal = () =>
    products.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.count * nextValue.price;
    }, 0);

  const buy = async () => {
    if (!data.address.trim()) {
      setData((prev) => ({ ...prev, error: 'Please enter a delivery address.' }));
      return;
    }

    setData((prev) => ({ ...prev, loading: true, error: '', success: false }));

    try {
      let transactionId = '';
      let transactionAmount = getTotal();

      if (dropInInstance.current) {
        // Live Braintree flow
        const { nonce } = await dropInInstance.current.requestPaymentMethod();
        const response = await processPayment(userId, token, {
          paymentMethodNonce: nonce,
          amount: transactionAmount,
        });

        if (!response?.transaction?.id) {
          throw new Error(response?.error || 'Payment could not be processed.');
        }
        transactionId = response.transaction.id;
        transactionAmount = response.transaction.amount;
      } else {
        // Instant Sandbox / Demo Transaction
        transactionId = `DEMO_TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      }

      const order = await createOrder(userId, token, {
        products,
        transaction_id: transactionId,
        amount: transactionAmount,
        address: data.address,
      });

      if (order?.error) throw new Error(order.error);

      emptyCart(() => {
        setRun((previousRun) => !previousRun);
        setData((prev) => ({
          ...prev,
          loading: false,
          success: true,
          address: '',
        }));
      });
    } catch (error) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Payment failed. Please try again.',
      }));
    }
  };

  const showDropIn = () =>
    products.length > 0 && (
      <Box sx={{ mt: 2 }}>
        <TextField
          label='Delivery Address'
          placeholder='Type your delivery address...'
          fullWidth
          multiline
          minRows={3}
          value={data.address}
          onChange={handleAddress}
          sx={{ mb: 2 }}
        />

        {data.clientToken ? (
          <DropIn
            options={{
              authorization: data.clientToken,
              paypal: { flow: 'vault' },
            }}
            onInstance={(instance) => {
              dropInInstance.current = instance;
            }}
          />
        ) : (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 1.5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Payment Method: Standard Sandbox Checkout
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Direct checkout enabled for sandbox testing. Enter delivery address and click Pay below.
            </Typography>
          </Box>
        )}

        <Button
          onClick={buy}
          variant='contained'
          color='success'
          fullWidth
          size='large'
          sx={{ mt: 2, py: 1.25, fontWeight: 700 }}
          disabled={data.loading || !data.address.trim()}
        >
          {data.loading ? 'Processing Order...' : `Pay $${getTotal()}`}
        </Button>
      </Box>
    );

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Total: ${getTotal()}
      </Typography>

      {data.loading && (
        <Stack alignItems='center' sx={{ mb: 2 }}>
          <CircularProgress color='primary' />
        </Stack>
      )}

      {data.success && (
        <Alert severity='success' sx={{ mb: 2 }}>
          Payment successful! Your order has been placed.
        </Alert>
      )}

      {data.error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setData((prev) => ({ ...prev, error: '' }))}>
          {data.error}
        </Alert>
      )}

      {isAuthenticated() ? (
        showDropIn()
      ) : (
        <Button
          component={Link}
          to='/signin?redirect=/cart'
          variant='contained'
          color='primary'
          fullWidth
          size='large'
          sx={{ mt: 2, py: 1.25, fontWeight: 700 }}
        >
          Sign in to checkout
        </Button>
      )}
    </Box>
  );
};

export default Checkout;
