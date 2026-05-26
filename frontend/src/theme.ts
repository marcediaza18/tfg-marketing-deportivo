import { createTheme, alpha } from '@mui/material/styles';

const PRIMARY = '#0f5e3a';
const PRIMARY_LIGHT = '#2e8b57';
const SECONDARY = '#ef6c00';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: PRIMARY, light: PRIMARY_LIGHT, dark: '#073d24' },
    secondary: { main: SECONDARY, light: '#ff9740', dark: '#b53d00' },
    success: { main: '#2e7d32' },
    background: { default: '#f3f5f7', paper: '#ffffff' },
    text: { primary: '#1b2533', secondary: '#5b6b80' },
    divider: alpha('#1b2533', 0.08),
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { letterSpacing: '0.1em', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 18,
          paddingRight: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.04)',
          border: `1px solid ${alpha('#1b2533', 0.05)}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_LIGHT} 100%)`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, minHeight: 48 },
      },
    },
  },
});
