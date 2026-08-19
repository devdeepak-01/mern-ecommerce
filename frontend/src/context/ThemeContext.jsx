import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeModeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setSystemDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const activeMode = useMemo(() => {
    if (themeMode === 'system') return systemDark ? 'dark' : 'light';
    return themeMode;
  }, [themeMode, systemDark]);

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
  };

  const theme = useMemo(() => {
    const isDark = activeMode === 'dark';

    return createTheme({
      palette: {
        mode: activeMode,
        primary: {
          main: isDark ? '#F472B6' : '#131921',
          light: isDark ? '#FBCFE8' : '#232F3E',
          dark: isDark ? '#DB2777' : '#0F1115',
          contrastText: isDark ? '#140E18' : '#ffffff',
        },
        secondary: {
          main: isDark ? '#EC4899' : '#FF9900',
          light: isDark ? '#FDF2F8' : '#FFF3E0',
          dark: isDark ? '#BE185D' : '#CC7A00',
          contrastText: isDark ? '#FFFFFF' : '#172033',
        },
        background: {
          default: isDark ? '#130E18' : '#F5F6F7',
          paper: isDark ? '#1C1424' : '#FFFFFF',
        },
        text: {
          primary: isDark ? '#FDF2F8' : '#172033',
          secondary: isDark ? '#C4B5C7' : '#5F6B7A',
          disabled: isDark ? '#7A6B7E' : '#8A94A6',
        },
        divider: isDark ? 'rgba(244, 114, 182, 0.16)' : '#E1E5EA',
        action: {
          hover: isDark ? 'rgba(244, 114, 182, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          selected: isDark ? 'rgba(244, 114, 182, 0.14)' : 'rgba(0, 0, 0, 0.08)',
        },
        success: {
          main: isDark ? '#34D399' : '#198754',
          light: isDark ? '#064E3B' : '#d1e7dd',
          contrastText: '#fff',
        },
        warning: {
          main: isDark ? '#FBBF24' : '#F59E0B',
          light: isDark ? '#78350F' : '#FFF3CD',
          contrastText: '#172033',
        },
        error: {
          main: isDark ? '#FB7185' : '#DC3545',
          light: isDark ? '#881337' : '#f8d7da',
          contrastText: '#fff',
        },
        info: {
          main: isDark ? '#60A5FA' : '#2563EB',
          light: isDark ? '#1E3A8A' : '#cfe2ff',
          contrastText: '#fff',
        },
      },
      typography: {
        fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
        h1: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 },
        h2: { fontWeight: 700, fontSize: '1.875rem', lineHeight: 1.25 },
        h3: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
        h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
        h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
        h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
        subtitle1: { fontWeight: 500, fontSize: '0.9375rem' },
        subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
        body1: { fontWeight: 400, fontSize: '0.9375rem', lineHeight: 1.6 },
        body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.55 },
        caption: { fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.4 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
      },
      shape: { borderRadius: 8 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')",
            body: {
              backgroundColor: isDark ? '#130E18' : '#F5F6F7',
              color: isDark ? '#FDF2F8' : '#172033',
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: '8px', height: '8px' },
              '&::-webkit-scrollbar-track': { background: isDark ? '#130E18' : '#F0F0F0' },
              '&::-webkit-scrollbar-thumb': {
                background: isDark ? '#4D3156' : '#c1c7d0',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: isDark ? '#6B4277' : '#9ba3af',
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? '#18101F' : '#131921',
              color: '#ffffff',
              boxShadow: 'none',
              borderBottom: isDark ? '1px solid rgba(244, 114, 182, 0.18)' : '1px solid #232F3E',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              fontWeight: 600,
              transition: 'all 0.15s ease-in-out',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            },
            containedPrimary: {
              backgroundColor: isDark ? '#EC4899' : '#131921',
              color: '#ffffff',
              fontWeight: 700,
              '&:hover': { backgroundColor: isDark ? '#DB2777' : '#232F3E' },
            },
            containedSecondary: {
              backgroundColor: isDark ? '#F472B6' : '#FF9900',
              color: isDark ? '#140E18' : '#172033',
              fontWeight: 700,
              border: isDark ? '1px solid #F472B6' : '1px solid #e68a00',
              '&:hover': { backgroundColor: isDark ? '#FBCFE8' : '#e68a00' },
            },
            outlined: {
              borderColor: isDark ? 'rgba(244, 114, 182, 0.45)' : '#c5ccd5',
              color: isDark ? '#FDF2F8' : '#172033',
              fontWeight: 600,
              backgroundColor: isDark ? 'rgba(244, 114, 182, 0.06)' : 'transparent',
              '&:hover': {
                borderColor: isDark ? '#F472B6' : '#131921',
                backgroundColor: isDark ? 'rgba(244, 114, 182, 0.15)' : 'rgba(19,25,33,0.05)',
                color: isDark ? '#ffffff' : '#131921',
              },
            },
            outlinedPrimary: {
              borderColor: isDark ? '#F472B6' : '#131921',
              color: isDark ? '#F472B6' : '#131921',
              fontWeight: 600,
              backgroundColor: isDark ? 'rgba(244, 114, 182, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(244, 114, 182, 0.18)' : 'rgba(19,25,33,0.05)',
                borderColor: isDark ? '#FBCFE8' : '#131921',
              },
            },
            text: {
              color: isDark ? '#FDF2F8' : '#172033',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(244, 114, 182, 0.1)' : 'rgba(0,0,0,0.04)',
              },
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              color: isDark ? '#FDF2F8' : '#5F6B7A',
              '&:hover': {
                color: isDark ? '#F472B6' : '#131921',
                backgroundColor: isDark ? 'rgba(244, 114, 182, 0.12)' : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              backgroundColor: isDark ? '#21172B' : '#f8fafc',
              color: isDark ? '#FDF2F8' : '#172033',
              fontWeight: 700,
              borderBottom: isDark ? '1px solid rgba(244, 114, 182, 0.18)' : '1px solid #E1E5EA',
            },
            body: {
              color: isDark ? '#FDF2F8' : '#172033',
              borderBottom: isDark ? '1px solid rgba(244, 114, 182, 0.12)' : '1px solid #E1E5EA',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              backgroundColor: isDark ? '#1C1424' : '#FFFFFF',
              border: isDark ? '1px solid rgba(244, 114, 182, 0.16)' : '1px solid #E1E5EA',
              boxShadow: isDark
                ? '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(236, 72, 153, 0.04)'
                : '0 1px 4px rgba(15,23,42,0.04)',
              transition: 'box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out, transform 0.15s ease-in-out',
              '&:hover': {
                boxShadow: isDark
                  ? '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(244, 114, 182, 0.12)'
                  : '0 4px 16px rgba(15,23,42,0.08)',
                borderColor: isDark ? 'rgba(244, 114, 182, 0.4)' : '#c5ccd5',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: isDark ? '#F472B6' : '#FF9900',
                  borderWidth: '2px',
                },
              },
              '& label.Mui-focused': { color: isDark ? '#F472B6' : '#FF9900' },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? '#F472B6' : '#FF9900',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 6,
            },
            filledDefault: {
              backgroundColor: isDark ? '#2A1D36' : '#E1E5EA',
              color: isDark ? '#FDF2F8' : '#172033',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              transition: 'background-color 0.15s ease-in-out',
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: isDark ? 'rgba(244, 114, 182, 0.16)' : '#E1E5EA',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: isDark ? '#1C1424' : '#FFFFFF',
            },
          },
        },
      },
    });
  }, [activeMode]);

  return (
    <ThemeModeContext.Provider value={{ themeMode, activeMode, changeThemeMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used within a ThemeProvider');
  return context;
};
