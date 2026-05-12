import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress, Autocomplete,
} from '@mui/material';
import { ScoutingRoute, createRoute, updateRoute, RouteOutcome } from '../api/scouting';
import { Athlete, listAthletes } from '../api/athletes';
import { apiError, toDateInput } from '../utils/format';

const OUTCOMES: RouteOutcome[] = ['abierta', 'firmado', 'descartado'];

interface Props {
  open: boolean;
  initial?: ScoutingRoute | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ScoutingRouteFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [athleteId, setAthleteId] = useState('');
  const [outcome, setOutcome] = useState<RouteOutcome>('abierta');
  const [closedAt, setClosedAt] = useState('');
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (initial) {
      const a = initial.athlete;
      setAthleteId(typeof a === 'string' ? a : a._id);
      setOutcome(initial.outcome);
      setClosedAt(toDateInput(initial.closedAt));
    } else {
      setAthleteId('');
      setOutcome('abierta');
      setClosedAt('');
    }
    if (!initial) {
      setLoading(true);
      listAthletes()
        .then((r) => setAthletes(r.items))
        .catch((err) => setError(apiError(err)))
        .finally(() => setLoading(false));
    }
  }, [open, initial]);

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      if (initial?._id) {
        await updateRoute(initial._id, { outcome, closedAt: closedAt || undefined });
      } else {
        await createRoute({ athlete: athleteId, outcome });
      }
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
      <DialogTitle>{initial ? 'Actualizar ruta de captación' : 'Nueva ruta de captación'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            {!initial && (
              <Autocomplete
                options={athletes}
                getOptionLabel={(a) => `${a.fullName}${a.currentClub ? ` (${a.currentClub})` : ''}`}
                value={athletes.find((a) => a._id === athleteId) ?? null}
                onChange={(_, v) => setAthleteId(v?._id ?? '')}
                renderInput={(params) => <TextField {...params} label="Deportista *" required />}
              />
            )}
            <TextField select label="Resultado" value={outcome}
              onChange={(e) => setOutcome(e.target.value as RouteOutcome)} fullWidth>
              {OUTCOMES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            {initial && outcome !== 'abierta' && (
              <TextField label="Fecha de cierre" type="date" value={closedAt}
                onChange={(e) => setClosedAt(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || (!initial && !athleteId)}>
          {saving ? <CircularProgress size={20} /> : initial ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
