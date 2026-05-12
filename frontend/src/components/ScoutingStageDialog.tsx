import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress,
} from '@mui/material';
import { addStage, StageStatus } from '../api/scouting';
import { apiError } from '../utils/format';

const STATUSES: StageStatus[] = ['planificado', 'en_curso', 'completado', 'descartado'];

interface Props {
  open: boolean;
  routeId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ScoutingStageDialog({ open, routeId, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    location: '',
    observations: '',
    ratingOverall: '',
    ratingTechnical: '',
    ratingPhysical: '',
    ratingTactical: '',
    ratingMental: '',
    status: 'completado' as StageStatus,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setForm({
        date: new Date().toISOString().slice(0, 10),
        location: '',
        observations: '',
        ratingOverall: '',
        ratingTechnical: '',
        ratingPhysical: '',
        ratingTactical: '',
        ratingMental: '',
        status: 'completado',
      });
    }
  }, [open]);

  async function handleSave(): Promise<void> {
    if (!routeId) return;
    setError('');
    setSaving(true);
    try {
      await addStage(routeId, {
        date: form.date,
        location: form.location,
        observations: form.observations || undefined,
        ratingOverall: form.ratingOverall ? Number(form.ratingOverall) : undefined,
        ratingTechnical: form.ratingTechnical ? Number(form.ratingTechnical) : undefined,
        ratingPhysical: form.ratingPhysical ? Number(form.ratingPhysical) : undefined,
        ratingTactical: form.ratingTactical ? Number(form.ratingTactical) : undefined,
        ratingMental: form.ratingMental ? Number(form.ratingMental) : undefined,
        status: form.status,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Añadir observación a la ruta</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField label="Fecha *" type="date" value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Ubicación *" value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} required />
          <TextField select label="Estado" value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as StageStatus }))}
            fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }}>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField label="Global (1-10)" type="number" inputProps={{ min: 1, max: 10 }}
            value={form.ratingOverall} onChange={(e) => setForm((f) => ({ ...f, ratingOverall: e.target.value }))} />
          <TextField label="Técnica (1-10)" type="number" inputProps={{ min: 1, max: 10 }}
            value={form.ratingTechnical} onChange={(e) => setForm((f) => ({ ...f, ratingTechnical: e.target.value }))} />
          <TextField label="Físico (1-10)" type="number" inputProps={{ min: 1, max: 10 }}
            value={form.ratingPhysical} onChange={(e) => setForm((f) => ({ ...f, ratingPhysical: e.target.value }))} />
          <TextField label="Táctica (1-10)" type="number" inputProps={{ min: 1, max: 10 }}
            value={form.ratingTactical} onChange={(e) => setForm((f) => ({ ...f, ratingTactical: e.target.value }))} />
          <TextField label="Mental (1-10)" type="number" inputProps={{ min: 1, max: 10 }}
            value={form.ratingMental} onChange={(e) => setForm((f) => ({ ...f, ratingMental: e.target.value }))} />
          <TextField label="Observaciones" value={form.observations}
            onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
            multiline rows={3} sx={{ gridColumn: { sm: '1 / span 2' } }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !form.location}>
          {saving ? <CircularProgress size={20} /> : 'Añadir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
