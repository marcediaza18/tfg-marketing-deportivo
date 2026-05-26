import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Alert, Stack, Skeleton, Avatar,
} from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import HandshakeIcon from '@mui/icons-material/Handshake';
import InventoryIcon from '@mui/icons-material/Inventory2';
import RouteIcon from '@mui/icons-material/Route';
import EuroIcon from '@mui/icons-material/Euro';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  getSummary, getAthletesByStatus, getAthletesByPosition,
  getSponsorshipsByMonth, getProductsByCategory, getScoutingFunnel,
  SummaryResponse, NameValue,
} from '../api/dashboard';
import { useAuth } from '../contexts/AuthContext';
import { formatEUR } from '../utils/format';

const PIE_COLORS = ['#0f5e3a', '#ef6c00', '#1565c0', '#6a1b9a', '#c62828', '#00838f', '#5d4037'];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = '#0f5e3a' }: StatCardProps) {
  return (
    <Card sx={{ height: '100%', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: `${accent}15`,
              color: accent,
              width: 44,
              height: 44,
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1 }}>
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [byStatus, setByStatus] = useState<NameValue[]>([]);
  const [byPosition, setByPosition] = useState<NameValue[]>([]);
  const [byMonth, setByMonth] = useState<{ label: string; total: number; count: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; revenue: number; units: number; count: number }[]>([]);
  const [funnel, setFunnel] = useState<NameValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getSummary(), getAthletesByStatus(), getAthletesByPosition(),
      getSponsorshipsByMonth(), getProductsByCategory(), getScoutingFunnel(),
    ])
      .then(([s, st, po, mo, ca, fu]) => {
        setSummary(s); setByStatus(st); setByPosition(po);
        setByMonth(mo); setByCategory(ca); setFunnel(fu);
      })
      .catch((err) => setError(err.message ?? 'Error al cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={48} />
        <Skeleton variant="text" width={500} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' }, gap: 2, mb: 3 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rounded" height={88} />)}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Skeleton variant="rounded" height={320} />
          <Skeleton variant="rounded" height={320} />
          <Skeleton variant="rounded" height={320} sx={{ gridColumn: { md: '1 / span 2' } }} />
          <Skeleton variant="rounded" height={320} />
          <Skeleton variant="rounded" height={320} />
        </Box>
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!summary) return null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">
          {greeting()}, {user?.fullName?.split(' ')[0] ?? ''} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resumen del sistema · datos en tiempo real desde MongoDB Atlas
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: 2, mb: 2,
        }}
      >
        <StatCard label="Deportistas" value={summary.counts.athletes} icon={<SportsSoccerIcon />} accent="#0f5e3a" />
        <StatCard label="Clientes" value={summary.counts.clients} icon={<GroupIcon />} accent="#1565c0" />
        <StatCard label="Eventos" value={summary.counts.events} icon={<EventIcon />} accent="#6a1b9a" />
        <StatCard label="Patrocinios" value={summary.counts.sponsorships} icon={<HandshakeIcon />} accent="#ef6c00" />
        <StatCard label="Productos" value={summary.counts.products} icon={<InventoryIcon />} accent="#c62828" />
        <StatCard label="Rutas captación" value={summary.counts.scoutingRoutes} icon={<RouteIcon />} accent="#00838f" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <StatCard label="Ingresos por patrocinios" value={formatEUR(summary.revenue.sponsorshipsEUR)} icon={<EuroIcon />} accent="#ef6c00" />
        <StatCard label="Ingresos por productos" value={formatEUR(summary.revenue.productsEUR)} icon={<StorefrontIcon />} accent="#6a1b9a" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Deportistas por estado</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Embudo de rutas de captación</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0f5e3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Patrocinios por mes (€)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatEUR(v)} />
                <Line type="monotone" dataKey="total" stroke="#ef6c00" strokeWidth={3}
                  dot={{ fill: '#ef6c00', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Deportistas por posición</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byPosition} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip />
                <Bar dataKey="value" fill="#1565c0" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Ingresos por categoría de producto</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" hide />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatEUR(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Ingresos €" fill="#6a1b9a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
