import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { listAthletes, Athlete } from '../api/athletes';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  prospecto: 'default',
  en_seguimiento: 'info',
  contactado: 'warning',
  firmado: 'success',
  descartado: 'error',
};

export function AthletesPage() {
  const [rows, setRows] = useState<Athlete[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const data = await listAthletes(q ? { q } : undefined);
      setRows(data.items);
    } catch (err) {
      setError((err as Error).message ?? 'Error al cargar deportistas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Nombre', flex: 1.5, minWidth: 180 },
    { field: 'position', headerName: 'Posición', flex: 1, minWidth: 130 },
    { field: 'currentClub', headerName: 'Club actual', flex: 1, minWidth: 150 },
    { field: 'nationality', headerName: 'Nacionalidad', flex: 0.8, minWidth: 110 },
    {
      field: 'marketValueEUR',
      headerName: 'Valor mercado',
      flex: 0.8,
      minWidth: 130,
      type: 'number',
      valueFormatter: (value: number | undefined) =>
        value != null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value) : '—',
    },
    {
      field: 'status',
      headerName: 'Estado',
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => (
        <Chip
          label={String(params.value).replace('_', ' ')}
          size="small"
          color={STATUS_COLOR[params.value as string] ?? 'default'}
        />
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Deportistas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disabled>
          Nuevo deportista
        </Button>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Buscar (nombre, club, notas)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter') refresh();
              }}
            />
            <Button variant="outlined" onClick={refresh}>Buscar</Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={rows.map((r) => ({ ...r, id: r._id }))}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                disableRowSelectionOnClick
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
