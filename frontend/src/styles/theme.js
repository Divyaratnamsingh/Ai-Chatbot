import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      primary: { main: '#4ade80', light: '#86efac', dark: '#16a34a' },
      secondary: { main: '#0f766e', light: '#14b8a6', dark: '#0f766e' },
      background: {
        default: '#1a201b',
        paper: '#242c26',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#9ca3af',
      },
      error: { main: '#ef4444' },
      warning: { main: '#fbbf24' },
      info: { main: '#14b8a6' },
      success: { main: '#22c55e' },
      divider: 'rgba(156, 163, 175, 0.12)',
    } : {
      primary: { main: '#0f766e', light: '#14b8a6', dark: '#115e59' },
      secondary: { main: '#16a34a', light: '#4ade80', dark: '#15803d' },
      background: {
        default: '#f4f6f1',
        paper: '#ffffff',
      },
      text: {
        primary: '#111827',
        secondary: '#4b5563',
      },
      error: { main: '#dc2626' },
      warning: { main: '#f59e0b' },
      info: { main: '#0d9488' },
      success: { main: '#16a34a' },
      divider: 'rgba(75, 85, 99, 0.12)',
    }),
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)'
            : 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)'
              : 'linear-gradient(135deg, #115e59 0%, #134e4a 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: mode === 'dark'
            ? '1px solid rgba(156, 163, 175, 0.1)'
            : '1px solid rgba(75, 85, 99, 0.1)',
          backdropFilter: 'blur(20px)',
          background: mode === 'dark'
            ? 'rgba(36, 44, 38, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 4px 24px rgba(15, 118, 110, 0.04)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          background: mode === 'dark'
            ? 'rgba(26, 32, 27, 0.95)'
            : 'rgba(244, 246, 241, 0.98)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
});

export default getTheme;
