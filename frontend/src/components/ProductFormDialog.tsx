import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress, FormControlLabel, Switch,
} from '@mui/material';
import { Product, createProduct, updateProduct } from '../api/products';
import { apiError } from '../utils/format';

const CATEGORIES = [
  'representacion', 'patrocinio', 'organizacion_eventos',
  'comunicacion', 'marketing_digital', 'consultoria', 'otro',
] as const;

interface Props {
  open: boolean;
  initial?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Product>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { category: 'otro', isActive: true, basePriceEUR: 0, unitsSold: 0, revenueEUR: 0 });
      setError('');
    }
  }, [open, initial]);

  function set<K extends keyof Product>(key: K, value: Product[K] | undefined): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePriceEUR: Number(form.basePriceEUR ?? 0),
        unitsSold: Number(form.unitsSold ?? 0),
        revenueEUR: Number(form.revenueEUR ?? 0),
      };
      if (initial?._id) await updateProduct(initial._id, payload);
      else await createProduct(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Editar producto' : 'Nuevo producto/servicio'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField label="Nombre *" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
          <TextField select label="Categoría" value={form.category ?? 'otro'} onChange={(e) => set('category', e.target.value as Product['category'])} fullWidth>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField label="Precio base (€) *" type="number" value={form.basePriceEUR ?? 0}
            onChange={(e) => set('basePriceEUR', Number(e.target.value))} required fullWidth />
          <TextField label="Unidades vendidas" type="number" value={form.unitsSold ?? 0}
            onChange={(e) => set('unitsSold', Number(e.target.value))} fullWidth />
          <TextField label="Ingresos generados (€)" type="number" value={form.revenueEUR ?? 0}
            onChange={(e) => set('revenueEUR', Number(e.target.value))} fullWidth />
          <TextField label="Descripción" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
            multiline rows={2} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
          <FormControlLabel
            control={<Switch checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} />}
            label="Activo"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !form.name}>
          {saving ? <CircularProgress size={20} /> : initial ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
