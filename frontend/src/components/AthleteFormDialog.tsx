import { useEffect, useState, ReactNode } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Box, Alert, CircularProgress,
  Autocomplete, Tabs, Tab, FormControlLabel, Switch, Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { Athlete, AthletePayload, BloodType, EducationLevel, PreferredFoot } from '../api/athletes';
import { Tour, listTours } from '../api/tours';
import { createAthlete, updateAthlete } from '../api/athletes';
import { apiError, toDateInput } from '../utils/format';

const POSITIONS = [
  'portero', 'lateral_derecho', 'lateral_izquierdo', 'central',
  'mediocentro_defensivo', 'mediocentro', 'mediocentro_ofensivo',
  'extremo_derecho', 'extremo_izquierdo', 'delantero',
];
const STATUSES = ['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado'] as const;
const FOOTS: PreferredFoot[] = ['izquierdo', 'derecho', 'ambidiestro'];
const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EDUCATION_LEVELS: EducationLevel[] = ['primaria', 'secundaria', 'bachillerato', 'fp', 'universitario', 'otro'];
const GUARDIAN_RELATIONS = ['madre', 'padre', 'tutor/a legal', 'abuelo/a', 'tío/a', 'hermano/a mayor'];

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

interface SectionProps {
  active: boolean;
  children: ReactNode;
}

function TabPanel({ active, children }: SectionProps) {
  if (!active) return null;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
      {children}
    </Box>
  );
}

export function AthleteFormDialog({ open, initial, onClose, onSaved }: Props) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<Partial<Athlete>>({});
  const [selectedTourId, setSelectedTourId] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(0);
      setForm(initial ? { ...initial } : { status: 'prospecto', isCaptain: false, tags: [], languages: [], allergies: [], secondaryPositions: [] });
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
      const num = (v: unknown): number | undefined =>
        v === '' || v == null ? undefined : Number(v);
      const payload: AthletePayload = {
        ...form,
        discoveredAtTour: selectedTourId || undefined,
        discoveredAtStopIdx: selectedTourId ? form.discoveredAtStopIdx : undefined,
        heightCm: num(form.heightCm),
        weightKg: num(form.weightKg),
        marketValueEUR: num(form.marketValueEUR),
        yearsPlaying: num(form.yearsPlaying),
        jerseyNumber: num(form.jerseyNumber),
        matchesPlayed: num(form.matchesPlayed),
        goalsScored: num(form.goalsScored),
        assists: num(form.assists),
        sprint40mSeconds: num(form.sprint40mSeconds),
        cooperTestKm: num(form.cooperTestKm),
        agreedFeeEUR: num(form.agreedFeeEUR),
        averageRating: num(form.averageRating),
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
      <DialogTitle>
        {initial ? `Editar — ${initial.fullName}` : 'Nuevo deportista'}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<PersonIcon />} iconPosition="start" label="Personal" />
          <Tab icon={<FitnessCenterIcon />} iconPosition="start" label="Físico y técnico" />
          <Tab icon={<LocalHospitalIcon />} iconPosition="start" label="Médico" />
          <Tab icon={<TravelExploreIcon />} iconPosition="start" label="Scouting" />
          <Tab icon={<HandshakeIcon />} iconPosition="start" label="Agencia" />
        </Tabs>

        {/* TAB 0 — Personal */}
        <TabPanel active={tab === 0}>
          <TextField label="Nombre completo *" value={form.fullName ?? ''}
            onChange={(e) => set('fullName', e.target.value)} required fullWidth
            sx={{ gridColumn: { sm: '1 / span 2' } }} />
          <TextField label="Fecha de nacimiento" type="date" value={toDateInput(form.birthDate)}
            onChange={(e) => set('birthDate', e.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField label="Nacionalidad" value={form.nationality ?? ''}
            onChange={(e) => set('nationality', e.target.value)} fullWidth />
          <TextField label="Documento (DNI / Passport)" value={form.documentId ?? ''}
            onChange={(e) => set('documentId', e.target.value)} fullWidth />
          <TextField label="URL foto" value={form.photoUrl ?? ''}
            onChange={(e) => set('photoUrl', e.target.value)} fullWidth
            helperText="URL pública de la foto del jugador" />
          <TextField label="Email" type="email" value={form.email ?? ''}
            onChange={(e) => set('email', e.target.value)} fullWidth />
          <TextField label="Teléfono" value={form.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)} fullWidth />
          <TextField label="Ciudad de residencia" value={form.addressCity ?? ''}
            onChange={(e) => set('addressCity', e.target.value)} fullWidth />
          <TextField label="País de residencia" value={form.addressCountry ?? ''}
            onChange={(e) => set('addressCountry', e.target.value)} fullWidth />
          <Autocomplete
            multiple freeSolo
            options={['español', 'inglés', 'francés', 'portugués', 'alemán', 'italiano', 'catalán', 'gallego']}
            value={form.languages ?? []}
            onChange={(_, v) => set('languages', v)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option} size="small" {...rest} />;
              })
            }
            renderInput={(params) => <TextField {...params} label="Idiomas" />}
            sx={{ gridColumn: { sm: '1 / span 2' } }}
          />
          <Box sx={{ gridColumn: { sm: '1 / span 2' }, mt: 2 }}>
            <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1, textTransform: 'uppercase' }}>
              Tutor / responsable legal
            </Box>
          </Box>
          <TextField label="Nombre del tutor" value={form.guardianName ?? ''}
            onChange={(e) => set('guardianName', e.target.value)} fullWidth />
          <TextField select label="Relación" value={form.guardianRelation ?? ''}
            onChange={(e) => set('guardianRelation', e.target.value)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {GUARDIAN_RELATIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField label="Teléfono del tutor" value={form.guardianPhone ?? ''}
            onChange={(e) => set('guardianPhone', e.target.value)} fullWidth />
          <TextField label="Email del tutor" type="email" value={form.guardianEmail ?? ''}
            onChange={(e) => set('guardianEmail', e.target.value)} fullWidth />
          <Box sx={{ gridColumn: { sm: '1 / span 2' }, mt: 2 }}>
            <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1, textTransform: 'uppercase' }}>
              Estudios
            </Box>
          </Box>
          <TextField select label="Nivel educativo" value={form.educationLevel ?? ''}
            onChange={(e) => set('educationLevel', (e.target.value || undefined) as EducationLevel | undefined)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {EDUCATION_LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
          <TextField label="Centro escolar" value={form.schoolName ?? ''}
            onChange={(e) => set('schoolName', e.target.value)} fullWidth />
        </TabPanel>

        {/* TAB 1 — Físico y técnico */}
        <TabPanel active={tab === 1}>
          <TextField label="Altura (cm)" type="number" value={form.heightCm ?? ''}
            onChange={(e) => set('heightCm', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Peso (kg)" type="number" value={form.weightKg ?? ''}
            onChange={(e) => set('weightKg', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField select label="Pie preferido" value={form.preferredFoot ?? ''}
            onChange={(e) => set('preferredFoot', (e.target.value || undefined) as PreferredFoot | undefined)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {FOOTS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <TextField label="Años jugando" type="number" value={form.yearsPlaying ?? ''}
            onChange={(e) => set('yearsPlaying', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField select label="Posición principal" value={form.position ?? ''}
            onChange={(e) => set('position', e.target.value)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {POSITIONS.map((p) => <MenuItem key={p} value={p}>{p.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <Autocomplete
            multiple options={POSITIONS}
            value={form.secondaryPositions ?? []}
            onChange={(_, v) => set('secondaryPositions', v)}
            getOptionLabel={(o) => o.replace('_', ' ')}
            renderInput={(params) => <TextField {...params} label="Posiciones secundarias" />}
          />
          <TextField label="Club / Academia actual" value={form.currentClub ?? ''}
            onChange={(e) => set('currentClub', e.target.value)} fullWidth />
          <TextField label="Dorsal" type="number" inputProps={{ min: 1, max: 99 }}
            value={form.jerseyNumber ?? ''}
            onChange={(e) => set('jerseyNumber', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <FormControlLabel
            control={<Switch checked={!!form.isCaptain} onChange={(e) => set('isCaptain', e.target.checked)} />}
            label="Capitán del equipo"
          />
          <Box />
          <Box sx={{ gridColumn: { sm: '1 / span 2' }, mt: 1 }}>
            <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1, textTransform: 'uppercase' }}>
              Estadísticas y pruebas físicas
            </Box>
          </Box>
          <TextField label="Partidos jugados" type="number" value={form.matchesPlayed ?? ''}
            onChange={(e) => set('matchesPlayed', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Goles" type="number" value={form.goalsScored ?? ''}
            onChange={(e) => set('goalsScored', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Asistencias" type="number" value={form.assists ?? ''}
            onChange={(e) => set('assists', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Sprint 40m (seg)" type="number" inputProps={{ step: 0.01 }}
            value={form.sprint40mSeconds ?? ''}
            onChange={(e) => set('sprint40mSeconds', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Test Cooper (km en 12min)" type="number" inputProps={{ step: 0.01 }}
            value={form.cooperTestKm ?? ''}
            onChange={(e) => set('cooperTestKm', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
        </TabPanel>

        {/* TAB 2 — Médico */}
        <TabPanel active={tab === 2}>
          <TextField select label="Grupo sanguíneo" value={form.bloodType ?? ''}
            onChange={(e) => set('bloodType', (e.target.value || undefined) as BloodType | undefined)} fullWidth>
            <MenuItem value="">—</MenuItem>
            {BLOOD_TYPES.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </TextField>
          <TextField label="Última revisión médica" type="date"
            value={toDateInput(form.lastMedicalCheckDate)}
            onChange={(e) => set('lastMedicalCheckDate', e.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <Autocomplete
            multiple freeSolo
            options={['polen', 'frutos secos', 'lactosa', 'gluten', 'penicilina', 'picaduras', 'huevo', 'marisco']}
            value={form.allergies ?? []}
            onChange={(_, v) => set('allergies', v)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option} size="small" color="warning" {...rest} />;
              })
            }
            renderInput={(params) => <TextField {...params} label="Alergias" />}
            sx={{ gridColumn: { sm: '1 / span 2' } }}
          />
          <TextField label="Historial de lesiones" value={form.injuries ?? ''}
            onChange={(e) => set('injuries', e.target.value)}
            multiline rows={4} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }}
            helperText="Lesiones previas, cirugías, observaciones médicas relevantes" />
        </TabPanel>

        {/* TAB 3 — Scouting */}
        <TabPanel active={tab === 3}>
          <TextField select label="Estado *" value={form.status ?? 'prospecto'}
            onChange={(e) => set('status', e.target.value as Athlete['status'])} required fullWidth>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField label="Rating medio (0-10)" type="number"
            inputProps={{ min: 0, max: 10, step: 0.1 }}
            value={form.averageRating ?? ''}
            onChange={(e) => set('averageRating', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <Autocomplete
            options={tours} loading={loadingTours}
            getOptionLabel={(t) => t.name}
            value={tours.find((t) => t._id === selectedTourId) ?? null}
            onChange={(_, v) => setSelectedTourId(v?._id ?? '')}
            renderInput={(params) => <TextField {...params} label="Descubierto en (tour)" />}
            sx={{ gridColumn: { sm: '1 / span 2' } }}
          />
          {selectedTour && selectedTour.stops.length > 0 && (
            <TextField select label="Parada concreta"
              value={form.discoveredAtStopIdx ?? ''}
              onChange={(e) => set('discoveredAtStopIdx', e.target.value === '' ? undefined : Number(e.target.value))}
              fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }}>
              <MenuItem value="">— Sin especificar —</MenuItem>
              {selectedTour.stops.map((stop, idx) => (
                <MenuItem key={idx} value={idx}>
                  {idx + 1}. {stop.city} ({stop.region || stop.country}){stop.tournamentName ? ` · ${stop.tournamentName}` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Autocomplete
            multiple freeSolo options={['niño', 'sub15', 'sub17', 'sub19', 'promesa', 'experimentado', 'cantera']}
            value={form.tags ?? []}
            onChange={(_, v) => set('tags', v)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option} size="small" color="info" {...rest} />;
              })
            }
            renderInput={(params) => <TextField {...params} label="Etiquetas" />}
            sx={{ gridColumn: { sm: '1 / span 2' } }}
          />
          <TextField label="Notas del ojeador" value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            multiline rows={4} fullWidth sx={{ gridColumn: { sm: '1 / span 2' } }} />
        </TabPanel>

        {/* TAB 4 — Agencia */}
        <TabPanel active={tab === 4}>
          <TextField label="Valor de mercado (€)" type="number" value={form.marketValueEUR ?? ''}
            onChange={(e) => set('marketValueEUR', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Honorarios pactados con la agencia (€)" type="number"
            value={form.agreedFeeEUR ?? ''}
            onChange={(e) => set('agreedFeeEUR', e.target.value ? Number(e.target.value) : undefined)} fullWidth />
          <TextField label="Fecha de firma" type="date" value={toDateInput(form.signedAt)}
            onChange={(e) => set('signedAt', e.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }} fullWidth />
          <TextField label="Fin de contrato" type="date" value={toDateInput(form.contractEndsAt)}
            onChange={(e) => set('contractEndsAt', e.target.value || undefined)}
            slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </TabPanel>
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
