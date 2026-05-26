import { useState, FormEvent } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Stack,
  CircularProgress, Divider, Chip,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DEMO_USERS = [
  { label: 'Dirección', email: 'direccion@agencia.test', password: 'direccion12345' },
  { label: 'Ojeador', email: 'ojeador@agencia.test', password: 'ojeador12345' },
  { label: 'Gestor productos', email: 'productos@agencia.test', password: 'productos12345' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('direccion@agencia.test');
  const [password, setPassword] = useState('direccion12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
      setError(msg ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #073d24 0%, #0f5e3a 50%, #2e8b57 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0%, transparent 50%),' +
            'radial-gradient(circle at 80% 70%, rgba(239, 108, 0, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Pelotas decorativas */}
      <SportsSoccerIcon
        sx={{
          position: 'absolute',
          top: '15%', left: '8%',
          fontSize: 100,
          color: 'rgba(255,255,255,0.08)',
          transform: 'rotate(-15deg)',
        }}
      />
      <SportsSoccerIcon
        sx={{
          position: 'absolute',
          bottom: '12%', right: '10%',
          fontSize: 140,
          color: 'rgba(255,255,255,0.06)',
          transform: 'rotate(20deg)',
        }}
      />

      <Card sx={{ maxWidth: 460, width: '100%', boxShadow: 8, zIndex: 1, overflow: 'visible' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={1} mb={3}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(15, 94, 58, 0.35)',
                mb: 1,
              }}
            >
              <SportsSoccerIcon sx={{ color: 'white', fontSize: 36 }} />
            </Box>
            <Typography variant="h5" sx={{ textAlign: 'center' }}>
              SI Marketing Deportivo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Trabajo Final de Grado · UCLM Talavera
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required fullWidth autoFocus
              />
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ py: 1.3 }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">USUARIOS DE PRUEBA</Typography>
          </Divider>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            {DEMO_USERS.map((u) => (
              <Chip
                key={u.email}
                label={u.label}
                size="small"
                onClick={() => { setEmail(u.email); setPassword(u.password); }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
            Haz click en un rol para autorrellenar las credenciales.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
