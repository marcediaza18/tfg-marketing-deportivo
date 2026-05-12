import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress, Autocomplete,
} from '@mui/material';
import { Sponsorship, createSponsorship, updateSponsorship } from '../api/sponsorships';
import { Client, listClients } from '../api/clients';
import { Athlete, listAthletes } from '../api/athletes';
import { SportEvent, listEvents } from '../api/events';
import { apiError, toDateInput } from '../utils/format';

const STATUSES = ['borrador', 'negociacion', 'activo', 'finalizado', 'cancelado'] as const;

function refId(v: Sponsorship['client'] | Sponsorship['athlete'] | Sponsorship['event']): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  return v._id;
}

interface FormState {
  clientId: string;
  athleteId: string;
  eventId: string;
  amountEUR: string;
  startDate: string;
  endDate: string;
  status: typeof STATUSES[number];
  description: string;
}

const EMPTY: FormState = {
  clientId: '', athleteId: '', eventId: '',
  amountEUR: '', startDate: '', endDate: '',
  status: 'borrador', description: '',
};

interface Props {
  open: boolean;
  initial?: Sponsorship | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SponsorshipFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [clients, setClients] = useState<Client[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(true);
    Promise.all([listClients(), listAthletes(), listEvents()])
      .then(([c, a, e]) => {
        setClients(c.items);
        setAthletes(a.items);
        setEvents(e.items);
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));

    if (initial) {
      setForm({
        clientId: refId(initial.client) ?? '',
        athleteId: refId(initial.athlete) ?? '',
        eventId: refId(initial.event) ?? '',
        amountEUR: String(initial.amountEUR),
        startDate: toDateInput(initial.startDate),
        endDate: toDateInput(initial.endDate),
        status: initial.status,
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
        client: form.clientId,
        athlete: form.athleteId || undefined,
        event: form.eventId || undefined,
        amountEUR: Number(form.amountEUR),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        description: form.description || undefined,
      };
      if (initial?._id) await updateSponsorship(initial._id, payload);
      else await createSponsorship(payload);
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
      <DialogTitle>{initial ? 'Editar patrocinio' : 'Nuevo patrocinio'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <Autocomplete
              options={clients}
              getOptionLabel={(c) => c.name}
              value={clients.find((c) => c._id === form.clientId) ?? null}
              onChange={(_, v) => set('clientId', v?._id ?? '')}
              renderInput={(params) => <TextField {...params} label="Cliente *" required />}
              sx={{ gridColumn: { sm: '1 / span 2' } }}
            />
            <Autocomplete
              options={athletes}
              getOptionLabel={(a) => a.fullName}
              value={athletes.find((a) => a._id === form.athleteId) ?? null}
              onChange={(_, v) => set('athleteId', v?._id ?? '')}
              renderInput={(params) => <TextField {...params} label="Deportista (opcional)" />}
            />
            <Autocomplete
              options={events}
              getOptionLabel={(e) => e.title}
              value={events.find((e) => e._id === form.eventId) ?? null}
              onChange={(_, v) => set('eventId', v?._id ?? '')}
              renderInput={(params) => <TextField {...params} label="Evento (opcional)" />}
            />
            <TextField label="Importe (€) *" type="number" value={form.amountEUR}
              onChange={(e) => set('amountEUR', e.target.value)} required fullWidth />
            <TextField select label="Estado" value={form.status}
              onChange={(e) => set('status', e.target.value as FormState['status'])} fullWidth>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField label="Fecha inicio *" type="date" value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)} required
              slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Fecha fin *" type="date" value={form.endDate}
              onChange={(e) => set('endDate', e.target.value)} required
              slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Descripción" value={form.description}
              onChange={(e) => set('description', e.target.value)} multiline rows={2} fullWidth
              sx={{ gridColumn: { sm: '1 / span 2' } }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained"
          disabled={saving || !form.clientId || !form.amountEUR || !form.startDate || !form.endDate}>
          {saving ? <CircularProgress size={20} /> : initial ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
