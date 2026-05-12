import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Tooltip,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import RouteIcon from '@mui/icons-material/Route';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory2';
import EventIcon from '@mui/icons-material/Event';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 240;

const navSections = [
  {
    title: 'Análisis',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { path: '/map', label: 'Mapa de tours', icon: <MapIcon /> },
    ],
  },
  {
    title: 'Scouting',
    items: [
      { path: '/tours', label: 'Tours de scouting', icon: <RouteIcon /> },
      { path: '/athletes', label: 'Deportistas', icon: <SportsSoccerIcon /> },
      { path: '/scouting', label: 'Rutas 1-a-1', icon: <TravelExploreIcon /> },
    ],
  },
  {
    title: 'Negocio',
    items: [
      { path: '/clients', label: 'Clientes', icon: <GroupIcon /> },
      { path: '/products', label: 'Productos y servicios', icon: <InventoryIcon /> },
      { path: '/events', label: 'Eventos', icon: <EventIcon /> },
      { path: '/sponsorships', label: 'Patrocinios', icon: <HandshakeIcon /> },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ojeador: 'Ojeador',
  gestor_productos: 'Gestor de productos',
  direccion: 'Dirección',
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <SportsSoccerIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SI Marketing Deportivo · TFG
          </Typography>
          {user && (
            <>
              <Chip
                label={ROLE_LABELS[user.role] ?? user.role}
                size="small"
                color="secondary"
                sx={{ mr: 2 }}
              />
              <Tooltip title={user.email}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
              <Tooltip title="Cerrar sesión">
                <IconButton color="inherit" onClick={logout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {navSections.map((section, idx) => (
            <Box key={section.title}>
              {idx > 0 && <Divider sx={{ my: 1 }} />}
              <Typography variant="overline" sx={{ pl: 2, color: 'text.secondary' }}>
                {section.title}
              </Typography>
              <List dense>
                {section.items.map((item) => (
                  <ListItemButton
                    key={item.path}
                    selected={location.pathname.startsWith(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ))}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
