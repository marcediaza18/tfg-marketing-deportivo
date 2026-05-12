import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, Typography, Alert,
  CircularProgress, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Sponsorship, listSponsorships, deleteSponsorship } from '../api/sponsorships';
import { useHasRole } from '../hooks/useRole';
import { SponsorshipFormDialog } from '../components/SponsorshipFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { apiError, formatDate, formatEUR } from '../utils/format';

const STATUS_COLOR: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  borrador: 'default',
  negociacion: 'warning',
  activo: 'success',
  finalizado: 'info',
  cancelado: 'error',
};

function refLabel(v: Sponsorship['client'] | Sponsorship['athlete'] | Sponsorship['event'], field: 'name' | 'fullName' | 'title'): string {
  if (!v || typeof v === 'string') return '—';
  const obj = v as Record<string, unknown>;
  return (obj[field] as string) ?? '—';
}

export function SponsorshipsPage() {
  const [rows, setRows] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsorship | null>(null);
  const [deleting, setDeleting] = useState<Sponsorship | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const canWrite = useHasRole('gestor_productos', 'direccion');
  const canDelete = useHasRole('direccion');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const data = await listSponsorships();
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
      await deleteSponsorship(deleting._id);
      setDeleting(null);
      await refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: GridColDef[] = [
    { field: 'client', headerName: 'Cliente', flex: 1.3, minWidth: 160,
      valueGetter: (_, row) => refLabel(row.client, 'name') },
    { field: 'athlete', headerName: 'Deportista', flex: 1.2, minWidth: 160,
      valueGetter: (_, row) => refLabel(row.athlete, 'fullName') },
    { field: 'event', headerName: 'Evento', flex: 1.2, minWidth: 160,
      valueGetter: (_, row) => refLabel(row.event, 'title') },
    { field: 'amountEUR', headerName: 'Importe', flex: 0.9, minWidth: 120, type: 'number',
      valueFormatter: (v: number) => formatEUR(v) },
    { field: 'startDate', headerName: 'Inicio', flex: 0.8, minWidth: 110,
      valueFormatter: (v: string) => formatDate(v) },
    { field: 'endDate', headerName: 'Fin', flex: 0.8, minWidth: 110,
      valueFormatter: (v: string) => formatDate(v) },
    {
      field: 'status', headerName: 'Estado', flex: 0.8, minWidth: 120,
      renderCell: (p) => (
        <Chip label={p.value} size="small" color={STATUS_COLOR[p.value as string] ?? 'default'} />
      ),
    },
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
        <Typography variant="h4">Patrocinios</Typography>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setFormOpen(true); }}>
            Nuevo patrocinio
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

      <SponsorshipFormDialog open={formOpen} initial={editing}
        onClose={() => setFormOpen(false)} onSaved={refresh} />
      <ConfirmDeleteDialog open={!!deleting}
        itemLabel={`patrocinio (${formatEUR(deleting?.amountEUR ?? 0)})`}
        onCancel={() => setDeleting(null)} onConfirm={handleDelete} loading={deletingBusy} />
    </Box>
  );
}
