import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1b5e20' },     // verde campo
    secondary: { main: '#ef6c00' },   // naranja
    background: { default: '#f5f6f8' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Roboto, system-ui, sans-serif',
  },
});
