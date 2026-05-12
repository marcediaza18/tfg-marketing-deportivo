import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AthletesPage } from './pages/AthletesPage';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/athletes" element={<AthletesPage />} />
          <Route path="/scouting" element={<Placeholder title="Rutas de captación" />} />
          <Route path="/clients" element={<Placeholder title="Clientes" />} />
          <Route path="/products" element={<Placeholder title="Productos y servicios" />} />
          <Route path="/events" element={<Placeholder title="Eventos" />} />
          <Route path="/sponsorships" element={<Placeholder title="Patrocinios" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
