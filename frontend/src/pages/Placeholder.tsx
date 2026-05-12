import { Box, Typography, Alert } from '@mui/material';

export function Placeholder({ title }: { title: string }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      <Alert severity="info">
        Esta sección se desarrollará en próximas iteraciones del TFG. El backend ya expone los
        endpoints CRUD correspondientes (ver <code>backend/src/routes/index.ts</code>).
      </Alert>
    </Box>
  );
}
