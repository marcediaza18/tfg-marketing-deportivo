import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, Typography, Alert,
  CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { SportEvent, listEvents, deleteEvent } from '../api/events';
import { useHasRole } from '../hooks/useRole';
import { EventFormDialog } from '../components/EventFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { apiError, formatDate, formatEUR } from '../utils/format';

function clientName(v: SportEvent['client']): string {
  if (!v || typeof v === 'string') return '—';
  return (v as { name?: string }).name ?? '—';
}

function athletesCount(v: SportEvent['participatingAthletes']): number {
  return v?.length ?? 0;
}

export function EventsPage() {
  const [rows, setRows] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SportEvent | null>(null);
  const [deleting, setDeleting] = useState<SportEvent | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const canWrite = useHasRole('gestor_productos', 'direccion');
  const canDelete = useHasRole('direccion');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const data = await listEvents();
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
      await deleteEvent(deleting._id);
      setDeleting(null);
      await refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Título', flex: 1.5, minWidth: 200 },
    { field: 'type', headerName: 'Tipo', flex: 1, minWidth: 130,
      valueFormatter: (v: string) => v?.replace('_', ' ') ?? '—' },
    { field: 'startDate', headerName: 'Inicio', flex: 0.8, minWidth: 110,
      valueFormatter: (v: string) => formatDate(v) },
    { field: 'location', headerName: 'Ubicación', flex: 1, minWidth: 120 },
    { field: 'client', headerName: 'Cliente', flex: 1, minWidth: 150,
      valueGetter: (_, row) => clientName(row.client) },
    { field: 'athletes', headerName: 'Deportistas', flex: 0.6, minWidth: 100, type: 'number',
      valueGetter: (_, row) => athletesCount(row.participatingAthletes) },
    { field: 'budgetEUR', headerName: 'Presupuesto', flex: 0.8, minWidth: 120, type: 'number',
      valueFormatter: (v: number) => formatEUR(v) },
    {
      field: 'actions', headerName: '', width: 100, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
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
        <Typography variant="h4">Eventos</Typography>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setFormOpen(true); }}>
            Nuevo evento
          </Button>
        )}
      </Stack>

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

      <EventFormDialog open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={refresh} />
      <ConfirmDeleteDialog open={!!deleting} itemLabel={deleting?.title ?? ''}
        onCancel={() => setDeleting(null)} onConfirm={handleDelete} loading={deletingBusy} />
    </Box>
  );
}
