import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Avatar, Chip, Stack, Divider, Alert,
  CircularProgress, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { Athlete, ageFromBirth, getAthlete } from '../api/athletes';
import { apiError, formatDate, formatEUR } from '../utils/format';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  prospecto: 'default',
  en_seguimiento: 'info',
  contactado: 'warning',
  firmado: 'success',
  descartado: 'error',
};

interface Props {
  open: boolean;
  athleteId: string | null;
  onClose: () => void;
  onEdit?: (athlete: Athlete) => void;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>{icon}</Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          pl: { sm: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0);
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: empty ? 'text.disabled' : 'text.primary' }}>
        {empty ? '—' : value}
      </Typography>
    </Box>
  );
}

function tourName(t: Athlete['discoveredAtTour']): string {
  if (!t) return '';
  if (typeof t === 'string') return t;
  return t.name ?? '';
}

export function AthleteDetailDialog({ open, athleteId, onClose, onEdit }: Props) {
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !athleteId) return;
    setLoading(true);
    setError('');
    getAthlete(athleteId)
      .then(setAthlete)
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [open, athleteId]);

  useEffect(() => {
    if (!open) setAthlete(null);
  }, [open]);

  const age = ageFromBirth(athlete?.birthDate);
  const rating = athlete?.averageRating ?? 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Ficha del jugador</Typography>
          <Stack direction="row" spacing={1}>
            {athlete && onEdit && (
              <Tooltip title="Editar">
                <IconButton onClick={() => onEdit(athlete)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Cerrar">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        {loading || !athlete ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Hero */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }} sx={{ mb: 3 }}>
              <Avatar
                src={athlete.photoUrl}
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'primary.main',
                  fontSize: 36,
                  border: '3px solid',
                  borderColor: 'background.paper',
                  boxShadow: 2,
                }}
              >
                {athlete.fullName.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5">{athlete.fullName}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {athlete.position && (
                    <Chip size="small" label={athlete.position.replace('_', ' ')} />
                  )}
                  {age != null && <Chip size="small" label={`${age} años`} variant="outlined" />}
                  {athlete.nationality && (
                    <Chip size="small" label={athlete.nationality} variant="outlined" />
                  )}
                  {athlete.isCaptain && (
                    <Chip size="small" label="capitán" color="warning" icon={<StarIcon />} />
                  )}
                  <Chip
                    size="small"
                    label={athlete.status.replace('_', ' ')}
                    color={STATUS_COLOR[athlete.status] ?? 'default'}
                  />
                </Stack>
                {athlete.averageRating != null && (
                  <Box sx={{ mt: 2, maxWidth: 360 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Rating medio</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{rating.toFixed(1)} / 10</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={rating * 10}
                      sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                    />
                  </Box>
                )}
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Section icon={<PersonIcon />} title="Datos personales">
              <Field label="Fecha de nacimiento" value={formatDate(athlete.birthDate)} />
              <Field label="Nacionalidad" value={athlete.nationality} />
              <Field label="Documento" value={athlete.documentId} />
              <Field label="Email" value={athlete.email} />
              <Field label="Teléfono" value={athlete.phone} />
              <Field label="Residencia" value={[athlete.addressCity, athlete.addressCountry].filter(Boolean).join(', ') || '—'} />
              <Field label="Idiomas" value={athlete.languages?.map((l) => <Chip key={l} label={l} size="small" sx={{ mr: 0.5 }} />)} />
            </Section>

            {(athlete.guardianName || athlete.guardianPhone || athlete.guardianEmail) && (
              <Section icon={<PersonIcon />} title="Tutor / responsable legal">
                <Field label="Nombre" value={athlete.guardianName} />
                <Field label="Relación" value={athlete.guardianRelation} />
                <Field label="Teléfono" value={athlete.guardianPhone} />
                <Field label="Email" value={athlete.guardianEmail} />
              </Section>
            )}

            {(athlete.educationLevel || athlete.schoolName) && (
              <Section icon={<SchoolIcon />} title="Estudios">
                <Field label="Nivel educativo" value={athlete.educationLevel} />
                <Field label="Centro escolar" value={athlete.schoolName} />
              </Section>
            )}

            <Section icon={<FitnessCenterIcon />} title="Físico y técnico">
              <Field label="Altura" value={athlete.heightCm ? `${athlete.heightCm} cm` : null} />
              <Field label="Peso" value={athlete.weightKg ? `${athlete.weightKg} kg` : null} />
              <Field label="Pie preferido" value={athlete.preferredFoot} />
              <Field label="Posición principal" value={athlete.position?.replace('_', ' ')} />
              <Field label="Posiciones secundarias"
                value={athlete.secondaryPositions?.map((p) => <Chip key={p} label={p.replace('_', ' ')} size="small" sx={{ mr: 0.5 }} />)} />
              <Field label="Club actual" value={athlete.currentClub} />
              <Field label="Dorsal" value={athlete.jerseyNumber} />
              <Field label="Años jugando" value={athlete.yearsPlaying} />
              <Field label="Partidos jugados" value={athlete.matchesPlayed} />
              <Field label="Goles" value={athlete.goalsScored} />
              <Field label="Asistencias" value={athlete.assists} />
              <Field label="Sprint 40m" value={athlete.sprint40mSeconds ? `${athlete.sprint40mSeconds}s` : null} />
              <Field label="Test Cooper" value={athlete.cooperTestKm ? `${athlete.cooperTestKm} km` : null} />
            </Section>

            <Section icon={<LocalHospitalIcon />} title="Médico">
              <Field label="Grupo sanguíneo" value={athlete.bloodType} />
              <Field label="Última revisión" value={formatDate(athlete.lastMedicalCheckDate)} />
              <Field label="Alergias"
                value={athlete.allergies?.map((a) => <Chip key={a} label={a} size="small" color="warning" sx={{ mr: 0.5 }} />)} />
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Field label="Historial de lesiones" value={athlete.injuries} />
              </Box>
            </Section>

            <Section icon={<TravelExploreIcon />} title="Scouting">
              <Field label="Descubierto en" value={tourName(athlete.discoveredAtTour)} />
              <Field label="Parada del tour" value={athlete.discoveredAtStopIdx != null ? `#${athlete.discoveredAtStopIdx + 1}` : null} />
              <Field label="Rating medio" value={athlete.averageRating != null ? `${athlete.averageRating.toFixed(1)} / 10` : null} />
              <Field label="Etiquetas"
                value={athlete.tags?.map((t) => <Chip key={t} label={t} size="small" color="info" sx={{ mr: 0.5 }} />)} />
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Field label="Notas del ojeador" value={athlete.notes} />
              </Box>
            </Section>

            <Section icon={<HandshakeIcon />} title="Agencia">
              <Field label="Valor de mercado" value={athlete.marketValueEUR ? formatEUR(athlete.marketValueEUR) : null} />
              <Field label="Honorarios" value={athlete.agreedFeeEUR ? formatEUR(athlete.agreedFeeEUR) : null} />
              <Field label="Fecha de firma" value={formatDate(athlete.signedAt)} />
              <Field label="Fin de contrato" value={formatDate(athlete.contractEndsAt)} />
            </Section>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
