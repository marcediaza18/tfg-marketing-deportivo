import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress, Autocomplete,
} from '@mui/material';
import { SportEvent, createEvent, updateEvent } from '../api/events';
import { Client, listClients } from '../api/clients';
import { Athlete, listAthletes } from '../api/athletes';
import { apiError, toDateInput } from '../utils/format';

const TYPES = ['partido', 'torneo', 'rueda_prensa', 'campana', 'activacion', 'otro'] as const;

function refId(v: SportEvent['client']): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  return v._id;
}

function refIds(v: SportEvent['participatingAthletes']): string[] {
  if (!v) return [];
  return v.map((x) => (typeof x === 'string' ? x : x._id));
}

interface Props {
  open: boolean;
  initial?: SportEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  type: typeof TYPES[number];
  startDate: string;
  endDate: string;
  location: string;
  clientId: string;
  athleteIds: string[];
  budgetEUR: string;
  actualCostEUR: string;
  description: string;
}

const EMPTY: FormState = {
  title: '', type: 'otro', startDate: '', endDate: '',
  location: '', clientId: '', athleteIds: [],
  budgetEUR: '', actualCostEUR: '', description: '',
};

export function EventFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [clients, setClients] = useState<Client[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(true);
    Promise.all([listClients(), listAthletes()])
      .then(([c, a]) => {
        setClients(c.items);
        setAthletes(a.items);
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));

    if (initial) {
      setForm({
        title: initial.title,
        type: initial.type,
        startDate: toDateInput(initial.startDate),
        endDate: toDateInput(initial.endDate),
        location: initial.location ?? '',
        clientId: refId(initial.client) ?? '',
        athleteIds: refIds(initial.participatingAthletes),
        budgetEUR: initial.budgetEUR != null ? String(initial.budgetEUR) : '',
        actualCostEUR: initial.actualCostEUR != null ? String(initial.actualCostEUR) : '',
        description: initial.description ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, initial]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(): Promise<void> {
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        location: form.location || undefined,
        client: form.clientId || undefined,
        participatingAthletes: form.athleteIds,
        budgetEUR: form.budgetEUR ? Number(form.budgetEUR) : undefined,
        actualCostEUR: form.actualCostEUR ? Number(form.actualCostEUR) : undefined,
        description: form.description || undefined,
      };
      if (initial?._id) await updateEvent(initial._id, payload);
      else await createEvent(payload);
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
      <DialogTitle>{initial ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField label="Título *" value={form.title} onChange={(e) => set('title', e.target.value)} required fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
            <TextField select label="Tipo" value={form.type} onChange={(e) => set('type', e.target.value as FormState['type'])} fullWidth>
              {TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
            </TextField>
            <TextField label="Ubicación" value={form.location} onChange={(e) => set('location', e.target.value)} fullWidth />
            <TextField label="Fecha inicio *" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Fecha fin" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <Autocomplete
              options={clients}
              getOptionLabel={(c) => c.name}
              value={clients.find((c) => c._id === form.clientId) ?? null}
              onChange={(_, v) => set('clientId', v?._id ?? '')}
              renderInput={(params) => <TextField {...params} label="Cliente" />}
              sx={{ gridColumn: { sm: '1 / span 2' } }}
            />
            <Autocomplete
              multiple
              options={athletes}
              getOptionLabel={(a) => a.fullName}
              value={athletes.filter((a) => form.athleteIds.includes(a._id))}
              onChange={(_, v) => set('athleteIds', v.map((a) => a._id))}
              renderInput={(params) => <TextField {...params} label="Deportistas participantes" />}
              sx={{ gridColumn: { sm: '1 / span 2' } }}
            />
            <TextField label="Presupuesto (€)" type="number" value={form.budgetEUR} onChange={(e) => set('budgetEUR', e.target.value)} fullWidth />
            <TextField label="Coste real (€)" type="number" value={form.actualCostEUR} onChange={(e) => set('actualCostEUR', e.target.value)} fullWidth />
            <TextField label="Descripción" value={form.description} onChange={(e) => set('description', e.target.value)} multiline rows={2} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !form.title || !form.startDate}>
          {saving ? <CircularProgress size={20} /> : initial ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
