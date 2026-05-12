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
} from '@mui/material';
import { Athlete, createAthlete, updateAthlete } from '../api/athletes';
import { apiError, toDateInput } from '../utils/format';

const POSITIONS = [
  'portero', 'lateral_derecho', 'lateral_izquierdo', 'central',
  'mediocentro_defensivo', 'mediocentro', 'mediocentro_ofensivo',
  'extremo_derecho', 'extremo_izquierdo', 'delantero',
];

const STATUSES = ['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado'] as const;

interface Props {
  open: boolean;
  initial?: Athlete | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AthleteFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Athlete>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { status: 'prospecto' });
      setError('');
    }
  }, [open, initial]);

  function set<K extends keyof Athlete>(key: K, value: Athlete[K] | undefined): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        marketValueEUR: form.marketValueEUR ? Number(form.marketValueEUR) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
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
            label="Club actual"
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
