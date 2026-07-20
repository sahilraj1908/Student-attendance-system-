import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Indigo
      light: '#818cf8',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed', // Violet
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#065f46',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#991b1b',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#92400e',
    },
    background: {
      default: '#f8fafc', // Slate 50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#475569', // Slate 600
    },
    divider: '#e2e8f0', // Slate 200
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontSize: '0.975rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        },
        elevation0: {
          border: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f1f5f9',
          color: '#475569',
        },
        root: {
          borderColor: '#e2e8f0',
          padding: '12px 16px',
        },
      },
    },
  },
});

