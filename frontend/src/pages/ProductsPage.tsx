import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Stack, Typography, Alert,
  CircularProgress, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Product, listProducts, deleteProduct } from '../api/products';
import { useHasRole } from '../hooks/useRole';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { apiError, formatEUR } from '../utils/format';

export function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const canWrite = useHasRole('gestor_productos', 'direccion');
  const canDelete = useHasRole('direccion');

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const data = await listProducts();
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
      await deleteProduct(deleting._id);
      setDeleting(null);
      await refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nombre', flex: 2, minWidth: 220 },
    { field: 'category', headerName: 'Categoría', flex: 1.2, minWidth: 150,
      valueFormatter: (v: string) => v?.replace('_', ' ') ?? '—' },
    { field: 'basePriceEUR', headerName: 'Precio base', flex: 0.8, minWidth: 110, type: 'number',
      valueFormatter: (v: number) => formatEUR(v) },
    { field: 'unitsSold', headerName: 'Uds. vendidas', flex: 0.7, minWidth: 110, type: 'number' },
    { field: 'revenueEUR', headerName: 'Ingresos', flex: 1, minWidth: 130, type: 'number',
      valueFormatter: (v: number) => formatEUR(v) },
    {
      field: 'isActive', headerName: 'Estado', flex: 0.6, minWidth: 100,
      renderCell: (p) => (
        <Chip label={p.value ? 'Activo' : 'Inactivo'} size="small" color={p.value ? 'success' : 'default'} />
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
        <Typography variant="h4">Productos y servicios</Typography>
        {canWrite && (
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => { setEditing(null); setFormOpen(true); }}>
            Nuevo producto
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

      <ProductFormDialog open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSaved={refresh} />
      <ConfirmDeleteDialog open={!!deleting} itemLabel={deleting?.name ?? ''}
        onCancel={() => setDeleting(null)} onConfirm={handleDelete} loading={deletingBusy} />
    </Box>
  );
}
