import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Stack, TextField,
  Typography, Alert, IconButton, Tooltip, Avatar, MenuItem, Skeleton, LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { listAthletes, deleteAthlete, Athlete, ageFromBirth } from '../api/athletes';
import { useHasRole } from '../hooks/useRole';
import { AthleteFormDialog } from '../components/AthleteFormDialog';
import { AthleteDetailDialog } from '../components/AthleteDetailDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { apiError, formatEUR } from '../utils/format';

const STATUS_COLOR: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  prospecto: 'default',
  en_seguimiento: 'info',
  contactado: 'warning',
  firmado: 'success',
  descartado: 'error',
};

const STATUSES = ['', 'prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado'] as const;

function tourName(v: Athlete['discoveredAtTour']): string {
  if (!v) return '—';
  if (typeof v === 'string') return '';
  return v.name ?? '—';
}

export function AthletesPage() {
  const [rows, setRows] = useState<Athlete[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Athlete | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const canWrite = useHasRole('ojeador', 'direccion');
  const canDelete = useHasRole('direccion');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const data = await listAthletes({
        ...(q ? { q } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setRows(data.items);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(): Promise<void> {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await deleteAthlete(deleting._id);
      setDeleting(null);
      await refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar src={params.row.photoUrl} sx={{ width: 36, height: 36 }}>
          {params.row.fullName?.charAt(0)}
        </Avatar>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Nombre',
      flex: 1.4,
      minWidth: 180,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="body2">{p.value}</Typography>
          {p.row.isCaptain && (
            <Tooltip title="Capitán">
              <StarIcon fontSize="inherit" sx={{ color: 'warning.main' }} />
            </Tooltip>
          )}
        </Stack>
      ),
    },
    { field: 'position', headerName: 'Posición', flex: 0.9, minWidth: 130,
      valueFormatter: (v: string) => v?.replace('_', ' ') ?? '—' },
    {
      field: 'age',
      headerName: 'Edad',
      width: 72,
      type: 'number',
      valueGetter: (_, row) => ageFromBirth(row.birthDate) ?? null,
      renderCell: (p) => p.value != null ? `${p.value}` : '—',
    },
    { field: 'currentClub', headerName: 'Club', flex: 1, minWidth: 140 },
    { field: 'nationality', headerName: 'Nac.', flex: 0.6, minWidth: 90 },
    {
      field: 'tourName',
      headerName: 'Descubierto en',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => tourName(row.discoveredAtTour),
    },
    {
      field: 'averageRating',
      headerName: 'Rating',
      width: 110,
      renderCell: (p) => {
        const v = p.value as number | undefined;
        if (v == null) return <Typography variant="caption" color="text.disabled">—</Typography>;
        const color = v >= 8 ? 'success.main' : v >= 6.5 ? 'info.main' : v >= 5 ? 'warning.main' : 'error.main';
        return (
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{v.toFixed(1)}</Typography>
            <LinearProgress
              variant="determinate"
              value={v * 10}
              sx={{
                height: 4, borderRadius: 2, mt: 0.3,
                '& .MuiLinearProgress-bar': { bgcolor: color },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'marketValueEUR',
      headerName: 'Valor',
      width: 110,
      type: 'number',
      valueFormatter: (value: number | undefined) => formatEUR(value),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={String(params.value).replace('_', ' ')}
          size="small"
          color={STATUS_COLOR[params.value as string] ?? 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Ver ficha">
            <IconButton size="small" onClick={() => setDetailId(params.row._id)}>
              <VisibilityIcon fontSize="small" />
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
        <Box>
          <Typography variant="h4">Deportistas</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? '...' : `${rows.length} jugadores en el sistema`}
          </Typography>
        </Box>
        {canWrite && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setFormOpen(true); }}
          >
            Nuevo deportista
          </Button>
        )}
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <TextField
              label="Buscar (nombre, club, notas, ciudad)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small" sx={{ flexGrow: 1 }}
              onKeyDown={(e) => { if (e.key === 'Enter') refresh(); }}
            />
            <TextField select label="Estado" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small" sx={{ minWidth: 180 }}>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s === '' ? 'Todos' : s.replace('_', ' ')}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" onClick={refresh}>Filtrar</Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <CardContent>
          {loading ? (
            <Stack spacing={1.5}>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={48} />
              ))}
            </Stack>
          ) : (
            <Box sx={{ height: 640 }}>
              <DataGrid
                rows={rows.map((r) => ({ ...r, id: r._id }))}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                disableRowSelectionOnClick
                onRowClick={(p) => setDetailId(p.row._id)}
                sx={{
                  '& .MuiDataGrid-row': { cursor: 'pointer' },
                  '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
                  border: 0,
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <AthleteFormDialog
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSaved={refresh}
      />
      <AthleteDetailDialog
        open={!!detailId}
        athleteId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(a) => { setEditing(a); setDetailId(null); setFormOpen(true); }}
      />
      <ConfirmDeleteDialog
        open={!!deleting}
        itemLabel={deleting?.fullName ?? ''}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
      />
    </Box>
  );
}
