import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, Typography, Alert,
  CircularProgress, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MapIcon from '@mui/icons-material/Map';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Tour, listTours, deleteTour } from '../api/tours';
import { useHasRole } from '../hooks/useRole';
import { TourFormDialog } from '../components/TourFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { apiError, formatDate, formatEUR } from '../utils/format';

const STATUS_COLOR: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  planificada: 'default',
  en_curso: 'info',
  completada: 'success',
  cancelada: 'error',
};

export function ToursPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tour | null>(null);
  const [deleting, setDeleting] = useState<Tour | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const canWrite = useHasRole('ojeador', 'direccion');
  const canDelete = useHasRole('direccion');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const data = await listTours();
      setRows(data.items);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleDelete(): Promise<void> {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await deleteTour(deleting._id);
      setDeleting(null);
      await refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 2, minWidth: 240 },
    { field: 'stopsCount', headerName: 'Paradas', flex: 0.5, minWidth: 80, type: 'number',
      valueGetter: (_, row) => row.stops?.length ?? 0 },
    { field: 'startDate', headerName: 'Inicio', flex: 0.8, minWidth: 110,
      valueFormatter: (v: string) => formatDate(v) },
    { field: 'endDate', headerName: 'Fin', flex: 0.8, minWidth: 110,
      valueFormatter: (v: string) => formatDate(v) },
    { field: 'pricePerKidEUR', headerName: 'Precio/niño', flex: 0.8, minWidth: 110, type: 'number',
      valueFormatter: (v: number) => formatEUR(v) },
    {
      field: 'status', headerName: 'Estado', flex: 0.8, minWidth: 120,
      renderCell: (p) => (
        <Chip label={String(p.value).replace('_', ' ')} size="small"
          color={STATUS_COLOR[p.value as string] ?? 'default'} />
      ),
    },
    {
      field: 'actions', headerName: '', width: 130, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ver en mapa">
            <IconButton size="small" onClick={() => navigate('/map')}>
              <MapIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canWrite && (
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => { setEditing(params.row); setFormOpen(true); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => setDeleting(params.row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Tours de scouting</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<MapIcon />} onClick={() => navigate('/map')}>
            Ver mapa de rendimiento
          </Button>
          {canWrite && (
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => { setEditing(null); setFormOpen(true); }}>
              Nuevo tour
            </Button>
          )}
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada tour es un viaje multi-ciudad donde se hacen torneos y scouting de niños.
        El mapa muestra qué tours generan más conversiones a eventos y mejor valoración técnica.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={rows.map((r) => ({ ...r, id: r._id }))}
                columns={columns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                disableRowSelectionOnClick
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <TourFormDialog open={formOpen} initial={editing}
        onClose={() => setFormOpen(false)} onSaved={refresh} />
      <ConfirmDeleteDialog open={!!deleting} itemLabel={deleting?.name ?? ''}
        onCancel={() => setDeleting(null)} onConfirm={handleDelete} loading={deletingBusy} />
    </Box>
  );
}
