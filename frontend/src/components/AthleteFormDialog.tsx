import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Athlete, createAthlete, updateAthlete } from '../api/athletes';
import { Tour, listTours } from '../api/tours';
import { apiError, toDateInput } from '../utils/format';

const POSITIONS = [
  'portero', 'lateral_derecho', 'lateral_izquierdo', 'central',
  'mediocentro_defensivo', 'mediocentro', 'mediocentro_ofensivo',
  'extremo_derecho', 'extremo_izquierdo', 'delantero',
];

const STATUSES = ['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado'] as const;

function tourId(v: Athlete['discoveredAtTour']): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v._id;
}

interface Props {
  open: boolean;
  initial?: Athlete | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AthleteFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Athlete>>({});
  const [selectedTourId, setSelectedTourId] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { status: 'prospecto' });
      setSelectedTourId(tourId(initial?.discoveredAtTour));
      setError('');
      setLoadingTours(true);
      listTours()
        .then((r) => setTours(r.items))
        .catch((err) => setError(apiError(err)))
        .finally(() => setLoadingTours(false));
    }
  }, [open, initial]);

  function set<K extends keyof Athlete>(key: K, value: Athlete[K] | undefined): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedTour = tours.find((t) => t._id === selectedTourId);

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        discoveredAtTour: selectedTourId || undefined,
        discoveredAtStopIdx: selectedTourId ? form.discoveredAtStopIdx : undefined,
        marketValueEUR: form.marketValueEUR != null ? Number(form.marketValueEUR) : undefined,
        heightCm: form.heightCm != null ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg != null ? Number(form.weightKg) : undefined,
        averageRating: form.averageRating != null ? Number(form.averageRating) : undefined,
      };
      if (initial?._id) await updateAthlete(initial._id, payload);
      else await createAthlete(payload);
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
      <DialogTitle>{initial ? 'Editar deportista' : 'Nuevo deportista'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField
            label="Nombre completo *"
            value={form.fullName ?? ''}
            onChange={(e) => set('fullName', e.target.value)}
            required
            fullWidth
          />
          <TextField
            select label="Posición"
            value={form.position ?? ''}
            onChange={(e) => set('position', e.target.value)}
            fullWidth
          >
            <MenuItem value="">—</MenuItem>
            {POSITIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          <TextField
            label="Club / Academia actual"
            value={form.currentClub ?? ''}
            onChange={(e) => set('currentClub', e.target.value)}
            fullWidth
          />
          <TextField
            label="Nacionalidad"
            value={form.nationality ?? ''}
            onChange={(e) => set('nationality', e.target.value)}
            fullWidth
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={toDateInput(form.birthDate)}
            onChange={(e) => set('birthDate', e.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            select label="Pie preferido"
            value={form.preferredFoot ?? ''}
            onChange={(e) => set('preferredFoot', (e.target.value || undefined) as Athlete['preferredFoot'])}
            fullWidth
          >
            <MenuItem value="">—</MenuItem>
            <MenuItem value="izquierdo">izquierdo</MenuItem>
            <MenuItem value="derecho">derecho</MenuItem>
            <MenuItem value="ambidiestro">ambidiestro</MenuItem>
          </TextField>
          <TextField
            label="Altura (cm)"
            type="number"
            value={form.heightCm ?? ''}
            onChange={(e) => set('heightCm', e.target.value ? Number(e.target.value) : undefined)}
            fullWidth
          />
          <TextField
            label="Peso (kg)"
            type="number"
            value={form.weightKg ?? ''}
            onChange={(e) => set('weightKg', e.target.value ? Number(e.target.value) : undefined)}
            fullWidth
          />
          <TextField
            label="Valor de mercado (€)"
            type="number"
            value={form.marketValueEUR ?? ''}
            onChange={(e) => set('marketValueEUR', e.target.value ? Number(e.target.value) : undefined)}
            fullWidth
          />
          <TextField
            select label="Estado *"
            value={form.status ?? 'prospecto'}
            onChange={(e) => set('status', e.target.value as Athlete['status'])}
            required fullWidth
          >
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <Autocomplete
            options={tours}
            loading={loadingTours}
            getOptionLabel={(t) => t.name}
            value={tours.find((t) => t._id === selectedTourId) ?? null}
            onChange={(_, v) => setSelectedTourId(v?._id ?? '')}
            renderInput={(params) => <TextField {...params} label="Descubierto en (tour)" />}
            sx={{ gridColumn: { sm: '1 / span 2' } }}
          />
          {selectedTour && selectedTour.stops.length > 0 && (
            <TextField
              select label="Parada concreta"
              value={form.discoveredAtStopIdx ?? ''}
              onChange={(e) => set('discoveredAtStopIdx', e.target.value === '' ? undefined : Number(e.target.value))}
              fullWidth
            >
              <MenuItem value="">— Sin especificar —</MenuItem>
              {selectedTour.stops.map((stop, idx) => (
                <MenuItem key={idx} value={idx}>
                  {idx + 1}. {stop.city} ({stop.region || stop.country}){stop.tournamentName ? ` · ${stop.tournamentName}` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Rating medio (0-10)"
            type="number"
            inputProps={{ min: 0, max: 10, step: 0.1 }}
            value={form.averageRating ?? ''}
            onChange={(e) => set('averageRating', e.target.value ? Number(e.target.value) : undefined)}
            fullWidth
          />
          <TextField
            label="Notas"
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            multiline rows={3} fullWidth
            sx={{ gridColumn: { sm: '1 / span 2' } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !form.fullName}>
          {saving ? <CircularProgress size={20} /> : (initial ? 'Guardar' : 'Crear')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
