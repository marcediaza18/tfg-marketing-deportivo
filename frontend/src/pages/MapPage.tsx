import { useEffect, useState, useMemo, Fragment } from 'react';
import {
  Box, Card, CardContent, Stack, Typography, Alert,
  CircularProgress, Chip, ToggleButton, ToggleButtonGroup, LinearProgress,
} from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTourPerformance, TourPerformance } from '../api/tours';
import { apiError, formatDate } from '../utils/format';

type Metric = 'avgRating' | 'conversionRate' | 'kidsDiscovered' | 'composite';

const METRIC_LABELS: Record<Metric, string> = {
  avgRating: 'Valoración técnica',
  conversionRate: 'Conversión a eventos',
  kidsDiscovered: 'Niños descubiertos',
  composite: 'Rendimiento global',
};

/** Verde brillante → amarillo → rojo según valor en [0,1]. */
function colorForScore(score01: number): string {
  const s = Math.max(0, Math.min(1, score01));
  // Interpolación HSL: 0 = rojo (0º), 0.5 = amarillo (60º), 1 = verde (120º)
  const hue = s * 120;
  return `hsl(${hue}, 70%, 45%)`;
}

function compositeScore(t: TourPerformance): number {
  return (t.conversionRate * t.avgRating) / 10;
}

function metricValue(t: TourPerformance, m: Metric): number {
  switch (m) {
    case 'avgRating': return t.avgRating;
    case 'conversionRate': return t.conversionRate;
    case 'kidsDiscovered': return t.kidsDiscovered;
    case 'composite': return compositeScore(t);
  }
}

/** Normaliza para colorear: rating 0-10, conversion 0-1, kids dividido por max global. */
function normalizedMetric(t: TourPerformance, m: Metric, maxKids: number): number {
  switch (m) {
    case 'avgRating': return t.avgRating / 10;
    case 'conversionRate': return t.conversionRate;
    case 'kidsDiscovered': return maxKids > 0 ? t.kidsDiscovered / maxKids : 0;
    case 'composite': return compositeScore(t);
  }
}

function FitBounds({ tours }: { tours: TourPerformance[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = tours.flatMap(
      (t) => t.stops.map((s): [number, number] => [s.lat, s.lng])
    );
    if (points.length > 0) {
      const bounds: LatLngBoundsExpression = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [tours, map]);
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 6, { duration: 1.2 });
  }, [target, map]);
  return null;
}

export function MapPage() {
  const [tours, setTours] = useState<TourPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState<Metric>('composite');
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  useEffect(() => {
    getTourPerformance()
      .then(setTours)
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const maxKids = useMemo(
    () => Math.max(1, ...tours.map((t) => t.kidsDiscovered)),
    [tours]
  );

  const ranked = useMemo(
    () => [...tours].sort((a, b) => metricValue(b, metric) - metricValue(a, metric)),
    [tours, metric]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4">Mapa de rendimiento de tours</Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza dónde están saliendo los mejores niños y qué tours convierten más en eventos.
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={metric}
          exclusive
          size="small"
          onChange={(_, v) => v && setMetric(v)}
          color="primary"
        >
          {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
            <ToggleButton key={m} value={m}>{METRIC_LABELS[m]}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 1fr' }, gap: 2 }}>
        <Card sx={{ minHeight: 600 }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, height: 660 }}>
            <MapContainer center={[35, -90]} zoom={3} style={{ height: '100%', width: '100%', borderRadius: 8 }} scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {tours.length > 0 && <FitBounds tours={tours} />}
              <FlyTo target={flyTarget} />

              {tours.map((tour) => {
                const score = normalizedMetric(tour, metric, maxKids);
                const color = colorForScore(score);
                return (
                  <Fragment key={tour._id}>
                    <Polyline
                      positions={tour.stops.map((s) => [s.lat, s.lng])}
                      pathOptions={{ color, weight: 3, opacity: 0.7 }}
                    />
                    {tour.stops.map((stop, idx) => (
                      <CircleMarker
                        key={`${tour._id}-${idx}-${metric}`}
                        center={[stop.lat, stop.lng]}
                        radius={6 + Math.sqrt(tour.kidsDiscovered) * 1.5}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.7,
                          weight: 2,
                        }}
                        eventHandlers={{ click: () => setFlyTarget([stop.lat, stop.lng]) }}
                      >
                        <LeafletTooltip direction="top" offset={[0, -8]}>
                          <Box sx={{ fontSize: '0.85rem' }}>
                            <strong>{stop.city}, {stop.region || stop.country}</strong><br />
                            <em>{stop.tournamentName}</em><br />
                            Tour: {tour.name}<br />
                            Niños descubiertos: <strong>{tour.kidsDiscovered}</strong><br />
                            En eventos: <strong>{tour.kidsInEvents}</strong> ({Math.round(tour.conversionRate * 100)}%)<br />
                            Rating medio: <strong>{tour.avgRating.toFixed(1)}/10</strong>
                          </Box>
                        </LeafletTooltip>
                      </CircleMarker>
                    ))}
                  </Fragment>
                );
              })}
            </MapContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ maxHeight: 660, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Ranking por {METRIC_LABELS[metric].toLowerCase()}
            </Typography>
            <Stack spacing={2}>
              {ranked.map((tour, i) => {
                const score = normalizedMetric(tour, metric, maxKids);
                const color = colorForScore(score);
                return (
                  <Box key={tour._id}
                    sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.default', cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => tour.stops[0] && setFlyTarget([tour.stops[0].lat, tour.stops[0].lng])}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ flexGrow: 1, mr: 1 }}>
                        #{i + 1} · {tour.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          metric === 'conversionRate' ? `${Math.round(tour.conversionRate * 100)}%`
                          : metric === 'avgRating' ? `${tour.avgRating.toFixed(1)}/10`
                          : metric === 'kidsDiscovered' ? tour.kidsDiscovered
                          : compositeScore(tour).toFixed(2)
                        }
                        sx={{ bgcolor: color, color: 'white', fontWeight: 600 }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={score * 100}
                      sx={{
                        mt: 1, height: 6, borderRadius: 3,
                        '& .MuiLinearProgress-bar': { bgcolor: color },
                        bgcolor: 'action.disabledBackground',
                      }}
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        👦 {tour.kidsDiscovered}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        🎯 {tour.kidsInEvents} ({Math.round(tour.conversionRate * 100)}%)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ⭐ {tour.avgRating.toFixed(1)}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {formatDate(tour.startDate)} → {formatDate(tour.endDate)}
                    </Typography>
                  </Box>
                );
              })}
              {ranked.length === 0 && (
                <Alert severity="info">No hay tours con paradas geocodificadas todavía.</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
