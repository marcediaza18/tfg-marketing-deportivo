import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Chip, Stack, Table, TableHead, TableRow, TableCell, TableBody,
  Alert, CircularProgress, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getRoute, ScoutingRoute } from '../api/scouting';
import { ScoutingStageDialog } from './ScoutingStageDialog';
import { apiError, formatDate } from '../utils/format';

interface Props {
  open: boolean;
  routeId: string | null;
  canWrite: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const STATUS_COLOR: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  planificado: 'default',
  en_curso: 'info',
  completado: 'success',
  descartado: 'error',
};

function refName(v: ScoutingRoute['athlete'] | ScoutingRoute['scout'], field: 'fullName'): string {
  if (!v || typeof v === 'string') return '—';
  return ((v as Record<string, unknown>)[field] as string) ?? '—';
}

export function ScoutingRouteDetail({ open, routeId, canWrite, onClose, onChanged }: Props) {
  const [route, setRoute] = useState<ScoutingRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stageOpen, setStageOpen] = useState(false);

  async function load(): Promise<void> {
    if (!routeId) return;
    setLoading(true);
    setError('');
    try {
      const r = await getRoute(routeId);
      setRoute(r);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && routeId) load();
    if (!open) setRoute(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, routeId]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Detalle de ruta de captación</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading || !route ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <Box>
              <Stack direction="row" spacing={3} sx={{ mb: 2 }} flexWrap="wrap">
                <Box>
                  <Typography variant="overline" color="text.secondary">Deportista</Typography>
                  <Typography variant="h6">{refName(route.athlete, 'fullName')}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Ojeador</Typography>
                  <Typography variant="h6">{refName(route.scout, 'fullName')}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Inicio</Typography>
                  <Typography variant="h6">{formatDate(route.startedAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">Resultado</Typography>
                  <Box><Chip label={route.outcome} color={route.outcome === 'firmado' ? 'success' : route.outcome === 'descartado' ? 'error' : 'default'} /></Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">Observaciones ({route.stages.length})</Typography>
                {canWrite && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setStageOpen(true)}>
                    Añadir observación
                  </Button>
                )}
              </Stack>

              {route.stages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay observaciones registradas para esta ruta.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Global</TableCell>
                      <TableCell>Téc.</TableCell>
                      <TableCell>Fís.</TableCell>
                      <TableCell>Tác.</TableCell>
                      <TableCell>Ment.</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {route.stages.map((s, i) => (
                      <TableRow key={s._id ?? i}>
                        <TableCell>{formatDate(s.date)}</TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell>{s.ratingOverall ?? '—'}</TableCell>
                        <TableCell>{s.ratingTechnical ?? '—'}</TableCell>
                        <TableCell>{s.ratingPhysical ?? '—'}</TableCell>
                        <TableCell>{s.ratingTactical ?? '—'}</TableCell>
                        <TableCell>{s.ratingMental ?? '—'}</TableCell>
                        <TableCell>
                          <Chip label={s.status.replace('_', ' ')} size="small"
                            color={STATUS_COLOR[s.status] ?? 'default'} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>{s.observations ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ScoutingStageDialog
        open={stageOpen}
        routeId={routeId}
        onClose={() => setStageOpen(false)}
        onSaved={() => { load(); onChanged(); }}
      />
    </>
  );
}
