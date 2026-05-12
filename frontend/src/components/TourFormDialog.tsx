import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress, IconButton, Stack,
  Typography, Divider, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tour, TourStop, createTour, updateTour, TourStatus } from '../api/tours';
import { apiError, toDateInput } from '../utils/format';

const STATUSES: TourStatus[] = ['planificada', 'en_curso', 'completada', 'cancelada'];

const emptyStop = (): TourStop => ({
  city: '',
  region: '',
  country: '',
  lat: 0,
  lng: 0,
  startDate: '',
  endDate: '',
  tournamentName: '',
});

interface Props {
  open: boolean;
  initial?: Tour | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TourFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Tour>>({});
  const [stops, setStops] = useState<TourStop[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        startDate: initial.startDate,
        endDate: initial.endDate,
        status: initial.status,
        pricePerKidEUR: initial.pricePerKidEUR,
      });
      setStops(initial.stops.map((s) => ({
        ...s,
        startDate: toDateInput(s.startDate),
        endDate: toDateInput(s.endDate),
      })));
    } else {
      setForm({ status: 'planificada' });
      setStops([]);
    }
  }, [open, initial]);

  function setStop(idx: number, patch: Partial<TourStop>): void {
    setStops((arr) => arr.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function removeStop(idx: number): void {
    setStops((arr) => arr.filter((_, i) => i !== idx));
  }

  function addStop(): void {
    setStops((arr) => [...arr, emptyStop()]);
  }

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate ? toDateInput(form.startDate) : undefined,
        endDate: form.endDate ? toDateInput(form.endDate) : undefined,
        status: form.status,
        pricePerKidEUR: form.pricePerKidEUR != null ? Number(form.pricePerKidEUR) : undefined,
        stops: stops.map((s) => ({
          ...s,
          lat: Number(s.lat),
          lng: Number(s.lng),
        })),
      };
      if (initial?._id) await updateTour(initial._id, payload);
      else await createTour(payload);
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
      <DialogTitle>{initial ? 'Editar tour' : 'Nuevo tour de scouting'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField label="Nombre *" value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required fullWidth
            sx={{ gridColumn: { sm: '1 / span 2' } }} />
          <TextField label="Fecha inicio *" type="date" value={toDateInput(form.startDate)}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            required slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField label="Fecha fin *" type="date" value={toDateInput(form.endDate)}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            required slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField select label="Estado" value={form.status ?? 'planificada'}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TourStatus }))} fullWidth>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField label="Precio por niño (€)" type="number" value={form.pricePerKidEUR ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, pricePerKidEUR: e.target.value ? Number(e.target.value) : undefined }))}
            fullWidth />
          <TextField label="Descripción" value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            multiline rows={2} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">Paradas del tour ({stops.length})</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addStop}>
            Añadir parada
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Cada parada necesita coordenadas. Puedes copiar latitud/longitud desde Google Maps (botón derecho → "¿Qué hay aquí?").
        </Typography>

        {stops.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aún no hay paradas. Añade al menos una para que el tour aparezca en el mapa.
          </Alert>
        ) : (
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            {stops.map((stop, idx) => (
              <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Parada {idx + 1}</Typography>
                  <Tooltip title="Eliminar parada">
                    <IconButton size="small" color="error" onClick={() => removeStop(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                  <TextField label="Ciudad *" value={stop.city}
                    onChange={(e) => setStop(idx, { city: e.target.value })} required size="small" />
                  <TextField label="Región/Estado" value={stop.region ?? ''}
                    onChange={(e) => setStop(idx, { region: e.target.value })} size="small" />
                  <TextField label="País *" value={stop.country}
                    onChange={(e) => setStop(idx, { country: e.target.value })} required size="small" />
                  <TextField label="Latitud *" type="number" inputProps={{ step: 0.000001 }} value={stop.lat}
                    onChange={(e) => setStop(idx, { lat: Number(e.target.value) })} required size="small" />
                  <TextField label="Longitud *" type="number" inputProps={{ step: 0.000001 }} value={stop.lng}
                    onChange={(e) => setStop(idx, { lng: Number(e.target.value) })} required size="small" />
                  <TextField label="Nombre del torneo" value={stop.tournamentName ?? ''}
                    onChange={(e) => setStop(idx, { tournamentName: e.target.value })} size="small" />
                  <TextField label="Inicio *" type="date" value={toDateInput(stop.startDate)}
                    onChange={(e) => setStop(idx, { startDate: e.target.value })}
                    required slotProps={{ inputLabel: { shrink: true } }} size="small" />
                  <TextField label="Fin *" type="date" value={toDateInput(stop.endDate)}
                    onChange={(e) => setStop(idx, { endDate: e.target.value })}
                    required slotProps={{ inputLabel: { shrink: true } }} size="small" />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained"
          disabled={saving || !form.name || !form.startDate || !form.endDate}>
          {saving ? <CircularProgress size={20} /> : initial ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
