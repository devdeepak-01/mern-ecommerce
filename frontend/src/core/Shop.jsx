import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Card from './Card.jsx';
import { getCategories, getFilteredProducts } from './apiCore.js';
import CategoriesFilter from './CategoriesFilter';
import PriceRangeFilter from './PriceRangeFilter';
import Footer from './Footer';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Divider,
  Paper,
  Skeleton,
} from '@mui/material';
import { FilterList, ChevronRight } from '@mui/icons-material';
import { prices } from './fixedPrices.js';

const Shop = () => {
  const [myFilters, setMyFilters] = useState({
    filters: { category: [], price: [] },
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(false);
  const [limit] = useState(24);
  const [skip, setSkip] = useState(0);
  const [size, setSize] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFilteredResults = (newFilters) => {
    setLoading(true);
    getFilteredProducts(0, limit, newFilters).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults(data.data);
        setSize(data.size);
        setSkip(0);
      }
      setLoading(false);
    });
  };

  const loadMore = () => {
    const toSkip = skip + limit;
    getFilteredProducts(toSkip, limit, myFilters.filters).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults([...filteredResults, ...data.data]);
        setSize(data.size);
        setSkip(toSkip);
      }
    });
  };

  useEffect(() => {
    getCategories().then((data) => {
      if (!data.error) setCategories(data);
    });
    loadFilteredResults({ category: [], price: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilters = (filters, filterBy) => {
    const value = filterBy === 'price' ? handlePrice(filters) : filters;
    const newFilters = {
      ...myFilters,
      filters: { ...myFilters.filters, [filterBy]: value },
    };
    loadFilteredResults(newFilters.filters);
    setMyFilters(newFilters);
  };

  const handlePrice = (value) => {
    let array = [];
    for (let key in prices) {
      if (prices[key]._id === parseInt(value)) {
        array = prices[key].array;
      }
    }
    return array;
  };

  const ProductSkeleton = () => (
    <Grid container spacing={2.5}>
      {[...Array(9)].map((_, i) => (
        <Grid key={i} size={{ xs: 6, sm: 4, md: 4 }}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="rectangular" height={200} />
            <Box sx={{ p: 1.5 }}>
              <Skeleton width="55%" height={12} sx={{ mb: 0.5 }} />
              <Skeleton width="90%" height={15} />
              <Skeleton width="35%" height={22} sx={{ mt: 0.75 }} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Layout title="Shop" description="Browse all products" showPageHeader={true}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Filter Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                position: { md: 'sticky' },
                top: { md: 80 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: '#131921',
                  color: '#fff',
                }}
              >
                <FilterList sx={{ fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                  Filters
                </Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Category
                </Typography>
                <CategoriesFilter
                  categories={categories}
                  handleFilters={(filters) => handleFilters(filters, 'category')}
                />

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Price Range
                </Typography>
                <PriceRangeFilter
                  prices={prices}
                  handleFilters={(filters) => handleFilters(filters, 'price')}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Products Grid */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Products
                {size > 0 && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: 'text.secondary', fontWeight: 400, ml: 1 }}
                  >
                    ({filteredResults.length} of {size})
                  </Typography>
                )}
              </Typography>
            </Box>

            {loading ? (
              <ProductSkeleton />
            ) : filteredResults.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or browse all products.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {filteredResults.map((product, i) => (
                  <Grid key={i} size={{ xs: 6, sm: 4, md: 4 }}>
                    <Card product={product} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Load More */}
            {size > 0 && size >= limit && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  onClick={loadMore}
                  variant="contained"
                  endIcon={<ChevronRight />}
                  sx={{
                    bgcolor: '#FF9900',
                    color: '#172033',
                    fontWeight: 700,
                    px: 4,
                    py: 1.25,
                    border: '1px solid #e68a00',
                    '&:hover': { bgcolor: '#e68a00' },
                  }}
                >
                  Load More Products
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </Layout>
  );
};

export default Shop;
