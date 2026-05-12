import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

import authRoutes from './authRoutes';
import * as athletes from '../controllers/athleteController';
import * as clients from '../controllers/clientController';
import * as products from '../controllers/productController';
import * as events from '../controllers/eventController';
import * as sponsorships from '../controllers/sponsorshipController';
import * as scouting from '../controllers/scoutingController';
import * as tours from '../controllers/tourController';
import * as dashboard from '../controllers/dashboardController';

const router = Router();

router.use('/auth', authRoutes);

// Athletes — todos los autenticados pueden leer; solo ojeador y dirección modifican.
router.get('/athletes', requireAuth, athletes.list);
router.get('/athletes/:id', requireAuth, athletes.get);
router.post('/athletes', requireAuth, requireRole('ojeador', 'direccion'), athletes.create);
router.put('/athletes/:id', requireAuth, requireRole('ojeador', 'direccion'), athletes.update);
router.delete('/athletes/:id', requireAuth, requireRole('direccion'), athletes.remove);

// Clients — solo dirección y gestor_productos
router.get('/clients', requireAuth, clients.list);
router.get('/clients/:id', requireAuth, clients.get);
router.post('/clients', requireAuth, requireRole('gestor_productos', 'direccion'), clients.create);
router.put('/clients/:id', requireAuth, requireRole('gestor_productos', 'direccion'), clients.update);
router.delete('/clients/:id', requireAuth, requireRole('direccion'), clients.remove);

// Products — solo gestor_productos y dirección
router.get('/products', requireAuth, products.list);
router.get('/products/:id', requireAuth, products.get);
router.post('/products', requireAuth, requireRole('gestor_productos', 'direccion'), products.create);
router.put('/products/:id', requireAuth, requireRole('gestor_productos', 'direccion'), products.update);
router.delete('/products/:id', requireAuth, requireRole('direccion'), products.remove);

// Events
router.get('/events', requireAuth, events.list);
router.get('/events/:id', requireAuth, events.get);
router.post('/events', requireAuth, requireRole('gestor_productos', 'direccion'), events.create);
router.put('/events/:id', requireAuth, requireRole('gestor_productos', 'direccion'), events.update);
router.delete('/events/:id', requireAuth, requireRole('direccion'), events.remove);

// Sponsorships
router.get('/sponsorships', requireAuth, sponsorships.list);
router.get('/sponsorships/:id', requireAuth, sponsorships.get);
router.post('/sponsorships', requireAuth, requireRole('gestor_productos', 'direccion'), sponsorships.create);
router.put('/sponsorships/:id', requireAuth, requireRole('gestor_productos', 'direccion'), sponsorships.update);
router.delete('/sponsorships/:id', requireAuth, requireRole('direccion'), sponsorships.remove);

// Scouting routes — ojeador y dirección
router.get('/scouting', requireAuth, scouting.list);
router.get('/scouting/:id', requireAuth, scouting.get);
router.post('/scouting', requireAuth, requireRole('ojeador', 'direccion'), scouting.create);
router.put('/scouting/:id', requireAuth, requireRole('ojeador', 'direccion'), scouting.update);
router.post('/scouting/:id/stages', requireAuth, requireRole('ojeador', 'direccion'), scouting.addStage);
router.delete('/scouting/:id', requireAuth, requireRole('direccion'), scouting.remove);

// Tours — ojeador y dirección crean/editan; dirección borra
router.get('/tours', requireAuth, tours.list);
router.get('/tours/:id', requireAuth, tours.get);
router.post('/tours', requireAuth, requireRole('ojeador', 'direccion'), tours.create);
router.put('/tours/:id', requireAuth, requireRole('ojeador', 'direccion'), tours.update);
router.delete('/tours/:id', requireAuth, requireRole('direccion'), tours.remove);

// Dashboard analytics — todos los autenticados, pensado especialmente para dirección
router.get('/dashboard/summary', requireAuth, dashboard.summary);
router.get('/dashboard/athletes-by-status', requireAuth, dashboard.athletesByStatus);
router.get('/dashboard/athletes-by-position', requireAuth, dashboard.athletesByPosition);
router.get('/dashboard/sponsorships-by-month', requireAuth, dashboard.sponsorshipsByMonth);
router.get('/dashboard/products-by-category', requireAuth, dashboard.productsByCategory);
router.get('/dashboard/scouting-funnel', requireAuth, dashboard.scoutingFunnel);
router.get('/dashboard/tour-performance', requireAuth, dashboard.tourPerformance);

export default router;
