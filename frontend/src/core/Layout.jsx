import React from 'react';
import Menu from './Menu';
import { Box, Container, Typography, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Layout = ({
  title = '',
  description = '',
  className,
  children,
  showPageHeader = true,
}) => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Menu />

    {/* Offset for fixed navbar */}
    <Box sx={{ pt: '64px' }}>
      {/* Compact page header — only shown when title is provided and showPageHeader is true */}
      {showPageHeader && title && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: { xs: 1.5, md: 2 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="lg" disableGutters>
            {description && (
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              </Breadcrumbs>
            )}
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}
            >
              {title}
            </Typography>
          </Container>
        </Box>
      )}

      {/* Main content area */}
      <Box
        className={className}
        sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%' }}
      >
        {children}
      </Box>
    </Box>
  </Box>
);

export default Layout;
