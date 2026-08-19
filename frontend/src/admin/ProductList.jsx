import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import Layout from '../core/Layout';
import AdminSidebar from '../components/AdminSidebar';
import { isAuthenticatedAdmin as isAuthenticated } from '../auth';
import { getProducts } from './apiAdmin';

const ProductList = () => {
  const auth = isAuthenticated() || {};
  const { user = {} } = auth;
  const [products, setProducts] = useState([]);

  const loadProducts = () => {
    getProducts().then((data) => {
      if (data && data.error) {
        console.error(data.error);
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <Layout
      title='Product List'
      description={`Hey ${user.name || 'Admin'}, ready to manage products?`}
    >
      <Grid container spacing={2}>
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card elevation={3}>
            <CardHeader
              title={`Total ${products.length} Products`}
              subheader='Manage, edit, or remove products below'
            />
            <Divider />
            <CardContent>
              {products.length === 0 ? (
                <Alert severity='info'>No products found.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {products.map((p) => (
                    <Grid key={p._id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            {p.name}
                          </Typography>
                          {p.description && (
                            <Typography variant='body2' color='text.secondary'>
                              {p.description.substring(0, 60)}...
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ProductList;
