import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Paper,
  Box,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getCategories } from './apiAdmin';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = () => {
    getCategories().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setCategories(data);
      }
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <AdminLayout title="Product Categories">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Manage categories for listing products
        </Typography>
        <Button
          component={Link}
          to="/create/category"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Category
        </Button>
      </Box>

      <Card elevation={2} sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Classification List ({categories.length} Categories)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {categories.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
              No categories defined. Click "Add Category" to create one.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <List sx={{ p: 0 }}>
                {categories.map((c, i) => (
                  <React.Fragment key={c._id || i}>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemText
                        primary={c.name}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                    {i < categories.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CategoryList;
