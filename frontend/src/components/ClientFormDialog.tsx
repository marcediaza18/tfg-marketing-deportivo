import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress, FormControlLabel, Switch,
} from '@mui/material';
import { Client, createClient, updateClient } from '../api/clients';
import { apiError } from '../utils/format';

const TYPES = ['marca', 'club', 'medio', 'institucion', 'otro'] as const;

interface Props {
  open: boolean;
  initial?: Client | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ClientFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Client>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { type: 'marca', isActive: true });
      setError('');
    }
  }, [open, initial]);

  function set<K extends keyof Client>(key: K, value: Client[K] | undefined): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      if (initial?._id) await updateClient(initial._id, form);
      else await createClient(form);
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
      <DialogTitle>{initial ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField label="Nombre *" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required fullWidth />
          <TextField select label="Tipo" value={form.type ?? 'marca'} onChange={(e) => set('type', e.target.value as Client['type'])} fullWidth>
            {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Email contacto" type="email" value={form.contactEmail ?? ''} onChange={(e) => set('contactEmail', e.target.value)} fullWidth />
          <TextField label="Teléfono" value={form.contactPhone ?? ''} onChange={(e) => set('contactPhone', e.target.value)} fullWidth />
          <TextField label="País" value={form.country ?? ''} onChange={(e) => set('country', e.target.value)} fullWidth />
          <TextField label="Industria/Sector" value={form.industry ?? ''} onChange={(e) => set('industry', e.target.value)} fullWidth />
          <TextField label="Notas" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} multiline rows={2} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
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
