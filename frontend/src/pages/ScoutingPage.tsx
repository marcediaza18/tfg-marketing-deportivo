import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, Typography, Alert,
  CircularProgress, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ScoutingRoute, listRoutes, deleteRoute } from '../api/scouting';
import { useHasRole } from '../hooks/useRole';
import { ScoutingRouteFormDialog } from '../components/ScoutingRouteFormDialog';
import { ScoutingRouteDetail } from '../components/ScoutingRouteDetail';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { apiError, formatDate } from '../utils/format';

const OUTCOME_COLOR: Record<string, 'default' | 'success' | 'error'> = {
  abierta: 'default',
  firmado: 'success',
  descartado: 'error',
};

function refLabel(v: ScoutingRoute['athlete'] | ScoutingRoute['scout'] | undefined, field: 'fullName'): string {
  if (!v || typeof v === 'string') return '—';
  return ((v as Record<string, unknown>)[field] as string) ?? '—';
}

export function ScoutingPage() {
  const [rows, setRows] = useState<ScoutingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScoutingRoute | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ScoutingRoute | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const canWrite = useHasRole('ojeador', 'direccion');
  const canDelete = useHasRole('direccion');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const data = await listRoutes();
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
      await deleteRoute(deleting._id);
      setDeleting(null);
      await refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: GridColDef[] = [
    { field: 'athlete', headerName: 'Deportista', flex: 1.5, minWidth: 180,
      valueGetter: (_, row) => refLabel(row.athlete, 'fullName') },
    { field: 'scout', headerName: 'Ojeador', flex: 1.2, minWidth: 150,
      valueGetter: (_, row) => refLabel(row.scout, 'fullName') },
    { field: 'startedAt', headerName: 'Inicio', flex: 0.8, minWidth: 110,
      valueFormatter: (v: string) => formatDate(v) },
    { field: 'stagesCount', headerName: 'Observaciones', flex: 0.8, minWidth: 130, type: 'number',
      valueGetter: (_, row) => row.stages?.length ?? 0 },
    {
      field: 'outcome', headerName: 'Resultado', flex: 0.8, minWidth: 120,
      renderCell: (p) => (
        <Chip label={p.value} size="small" color={OUTCOME_COLOR[p.value as string] ?? 'default'} />
      ),
    },
    {
      field: 'actions', headerName: '', width: 140, sortable: false, filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ver detalle">
            <IconButton size="small" onClick={() => setDetailId(params.row._id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canWrite && (
            <Tooltip title="Cambiar resultado">
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
        <Typography variant="h4">Rutas de captación</Typography>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setFormOpen(true); }}>
            Nueva ruta
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

      <ScoutingRouteFormDialog open={formOpen} initial={editing}
        onClose={() => setFormOpen(false)} onSaved={refresh} />
      <ScoutingRouteDetail open={!!detailId} routeId={detailId} canWrite={canWrite}
        onClose={() => setDetailId(null)} onChanged={refresh} />
      <ConfirmDeleteDialog open={!!deleting}
        itemLabel={`ruta de ${refLabel(deleting?.athlete, 'fullName')}`}
        onCancel={() => setDeleting(null)} onConfirm={handleDelete} loading={deletingBusy} />
    </Box>
  );
}
