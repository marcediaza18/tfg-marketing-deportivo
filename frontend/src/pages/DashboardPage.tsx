import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  getSummary,
  getAthletesByStatus,
  getAthletesByPosition,
  getSponsorshipsByMonth,
  getProductsByCategory,
  getScoutingFunnel,
  SummaryResponse,
  NameValue,
} from '../api/dashboard';

const PIE_COLORS = ['#1b5e20', '#ef6c00', '#1565c0', '#6a1b9a', '#c62828', '#00838f', '#5d4037'];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
}

function formatEUR(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [byStatus, setByStatus] = useState<NameValue[]>([]);
  const [byPosition, setByPosition] = useState<NameValue[]>([]);
  const [byMonth, setByMonth] = useState<{ label: string; total: number; count: number }[]>([]);
  const [byCategory, setByCategory] = useState<
    { name: string; revenue: number; units: number; count: number }[]
  >([]);
  const [funnel, setFunnel] = useState<NameValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getSummary(),
      getAthletesByStatus(),
      getAthletesByPosition(),
      getSponsorshipsByMonth(),
      getProductsByCategory(),
      getScoutingFunnel(),
    ])
      .then(([s, st, po, mo, ca, fu]) => {
        setSummary(s);
        setByStatus(st);
        setByPosition(po);
        setByMonth(mo);
        setByCategory(ca);
        setFunnel(fu);
      })
      .catch((err) => setError(err.message ?? 'Error al cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!summary) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cuadro de mando
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Indicadores clave del sistema. Datos en tiempo real desde MongoDB.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <StatCard label="Deportistas" value={summary.counts.athletes} />
        <StatCard label="Clientes" value={summary.counts.clients} />
        <StatCard label="Eventos" value={summary.counts.events} />
        <StatCard label="Patrocinios" value={summary.counts.sponsorships} />
        <StatCard label="Productos" value={summary.counts.products} />
        <StatCard label="Rutas captación" value={summary.counts.scoutingRoutes} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard label="Ingresos por patrocinios" value={formatEUR(summary.revenue.sponsorshipsEUR)} />
        <StatCard label="Ingresos por productos" value={formatEUR(summary.revenue.productsEUR)} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6">Deportistas por estado</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6">Embudo de rutas de captación</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1b5e20" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
          <CardContent>
            <Typography variant="h6">Patrocinios por mes (€)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatEUR(v)} />
                <Line type="monotone" dataKey="total" stroke="#ef6c00" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6">Deportistas por posición</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byPosition} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip />
                <Bar dataKey="value" fill="#1565c0" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6">Ingresos por categoría de producto</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatEUR(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Ingresos €" fill="#6a1b9a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
