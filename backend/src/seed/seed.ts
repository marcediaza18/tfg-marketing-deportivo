/**
 * Script de poblado de datos de ejemplo para el SI de marketing deportivo.
 *
 * Uso: npm run seed
 *
 * Genera usuarios con cada rol, tours de scouting con paradas geocodificadas,
 * niños descubiertos en esos tours (con valoraciones), clientes, productos,
 * eventos donde participan los mejores niños y patrocinios.
 *
 * Lo importante de la modelización:
 * - Un Tour es un viaje multi-ciudad (p.ej. Arizona-California-Nevada-Oregon).
 * - En cada parada del tour se hacen torneos y se evalúa a niños.
 * - Cada niño descubierto queda referenciado al tour donde se le vio.
 * - Algunos niños son luego invitados a eventos (de pago) y participan.
 * - El cálculo de "rendimiento de tour" se hace en runtime en el endpoint
 *   /api/dashboard/tour-performance combinando esos datos.
 */
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Athlete } from '../models/Athlete';
import { Client } from '../models/Client';
import { Product } from '../models/Product';
import { Event } from '../models/Event';
import { Sponsorship } from '../models/Sponsorship';
import { ScoutingRoute } from '../models/ScoutingRoute';
import { Tour } from '../models/Tour';

const POSITIONS = ['portero', 'lateral_derecho', 'lateral_izquierdo', 'central', 'mediocentro_defensivo', 'mediocentro', 'mediocentro_ofensivo', 'extremo_derecho', 'extremo_izquierdo', 'delantero'];
const FIRST_NAMES_KID = ['Liam', 'Noah', 'Mateo', 'Lucas', 'Sebastián', 'Diego', 'Adrián', 'Daniel', 'Carlos', 'Marco', 'Ethan', 'Logan', 'Aiden', 'Carter', 'Jackson', 'Mason', 'Owen', 'Hugo', 'Pablo', 'Iván', 'Jaden', 'Aaron', 'Caleb', 'Tyler'];
const LAST_NAMES = ['García', 'Martínez', 'López', 'Rodríguez', 'Pérez', 'González', 'Sánchez', 'Fernández', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Cruz', 'Reyes', 'Morales', 'Ortiz', 'Vargas', 'Castro'];
const GUARDIAN_FIRST = ['Carmen', 'María', 'Patricia', 'José', 'Juan', 'Antonio', 'Luis', 'Sandra', 'Elena', 'Beatriz', 'Sarah', 'Michael', 'Jennifer', 'David', 'Linda'];
const GUARDIAN_RELATIONS = ['madre', 'padre', 'madre', 'padre', 'tía', 'tío', 'abuela'];
const LANGUAGES_POOL_USA = ['inglés', 'español', 'francés', 'portugués'];
const LANGUAGES_POOL_ES = ['español', 'inglés', 'francés', 'catalán', 'gallego'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const ALLERGIES_POOL = ['polen', 'frutos secos', 'lactosa', 'gluten', 'penicilina', 'picaduras'];
const EDUCATION_LEVELS = ['primaria', 'secundaria', 'bachillerato', 'fp'] as const;
const INJURIES_TEMPLATES = [
  'Sin lesiones relevantes en los últimos 24 meses.',
  'Esguince leve de tobillo derecho hace 8 meses, recuperado completamente.',
  'Sobrecarga muscular en isquiotibiales (2024), tratamiento conservador.',
  'Fractura de clavícula a los 11 años, sin secuelas.',
  'Tendinitis rotuliana ocasional, controlada con fisioterapia preventiva.',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Cada tour tiene su rendimiento "real" predefinido — algunos producen mejores
 * niños que otros (avgRatingTarget, conversionTarget). Esto hace que el mapa y
 * los KPIs sean interpretables al primer vistazo en la demo.
 */
interface TourSeed {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  pricePerKidEUR: number;
  avgRatingTarget: number;        // rating medio objetivo (1-10) para los niños
  conversionTarget: number;        // proporción de niños invitados a eventos (0-1)
  kidsCount: number;
  stops: Array<{
    city: string;
    region: string;
    country: string;
    lat: number;
    lng: number;
    daysOffset: number;            // días desde el inicio del tour
    daysDuration: number;
    tournamentName: string;
  }>;
}

const TOURS_SEED: TourSeed[] = [
  {
    name: 'West Coast USA Talent Tour',
    description: 'Tour de scouting por el suroeste de EE.UU. con torneos sub-15 y sub-17.',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-11-30'),
    pricePerKidEUR: 350,
    avgRatingTarget: 8.2,
    conversionTarget: 0.55,
    kidsCount: 18,
    stops: [
      { city: 'Phoenix', region: 'Arizona', country: 'USA', lat: 33.4484, lng: -112.0740, daysOffset: 0, daysDuration: 14, tournamentName: 'Arizona Cup U15' },
      { city: 'Los Angeles', region: 'California', country: 'USA', lat: 34.0522, lng: -118.2437, daysOffset: 21, daysDuration: 21, tournamentName: 'LA Premier Showcase' },
      { city: 'Las Vegas', region: 'Nevada', country: 'USA', lat: 36.1699, lng: -115.1398, daysOffset: 49, daysDuration: 14, tournamentName: 'Vegas Soccer Fest' },
      { city: 'Portland', region: 'Oregon', country: 'USA', lat: 45.5152, lng: -122.6784, daysOffset: 70, daysDuration: 14, tournamentName: 'Pacific NW Trophy' },
    ],
  },
  {
    name: 'Texas Triangle Scouting',
    description: 'Recorrido por el triángulo Houston-Dallas-Austin en busca de talento U16.',
    startDate: new Date('2025-06-10'),
    endDate: new Date('2025-07-25'),
    pricePerKidEUR: 280,
    avgRatingTarget: 7.4,
    conversionTarget: 0.35,
    kidsCount: 14,
    stops: [
      { city: 'Houston', region: 'Texas', country: 'USA', lat: 29.7604, lng: -95.3698, daysOffset: 0, daysDuration: 14, tournamentName: 'Houston Soccer Open' },
      { city: 'Dallas', region: 'Texas', country: 'USA', lat: 32.7767, lng: -96.7970, daysOffset: 18, daysDuration: 14, tournamentName: 'Dallas Cup U16' },
      { city: 'Austin', region: 'Texas', country: 'USA', lat: 30.2672, lng: -97.7431, daysOffset: 35, daysDuration: 10, tournamentName: 'Austin Showcase' },
    ],
  },
  {
    name: 'Florida Sun Tour',
    description: 'Tour de invierno por Florida buscando talentos juveniles en torneos de élite.',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-03-30'),
    pricePerKidEUR: 320,
    avgRatingTarget: 6.5,
    conversionTarget: 0.25,
    kidsCount: 16,
    stops: [
      { city: 'Miami', region: 'Florida', country: 'USA', lat: 25.7617, lng: -80.1918, daysOffset: 0, daysDuration: 18, tournamentName: 'Miami Beach Cup' },
      { city: 'Orlando', region: 'Florida', country: 'USA', lat: 28.5383, lng: -81.3792, daysOffset: 21, daysDuration: 14, tournamentName: 'Disney Showcase' },
      { city: 'Tampa', region: 'Florida', country: 'USA', lat: 27.9506, lng: -82.4572, daysOffset: 40, daysDuration: 12, tournamentName: 'Tampa Bay Open' },
      { city: 'Jacksonville', region: 'Florida', country: 'USA', lat: 30.3322, lng: -81.6557, daysOffset: 55, daysDuration: 14, tournamentName: 'North Florida Trophy' },
    ],
  },
  {
    name: 'Tour España Centro-Sur',
    description: 'Tour por capitales españolas con torneos de fútbol base.',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2025-05-30'),
    pricePerKidEUR: 220,
    avgRatingTarget: 7.8,
    conversionTarget: 0.45,
    kidsCount: 12,
    stops: [
      { city: 'Madrid', region: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038, daysOffset: 0, daysDuration: 14, tournamentName: 'Copa Madrid Juvenil' },
      { city: 'Toledo', region: 'Castilla-La Mancha', country: 'España', lat: 39.8628, lng: -4.0273, daysOffset: 16, daysDuration: 10, tournamentName: 'Trofeo Castilla' },
      { city: 'Sevilla', region: 'Andalucía', country: 'España', lat: 37.3891, lng: -5.9845, daysOffset: 28, daysDuration: 14, tournamentName: 'Sevilla Cup Sub-17' },
      { city: 'Granada', region: 'Andalucía', country: 'España', lat: 37.1773, lng: -3.5986, daysOffset: 45, daysDuration: 10, tournamentName: 'Trofeo Alhambra' },
    ],
  },
];

async function clearAll(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Athlete.deleteMany({}),
    Client.deleteMany({}),
    Product.deleteMany({}),
    Event.deleteMany({}),
    Sponsorship.deleteMany({}),
    ScoutingRoute.deleteMany({}),
    Tour.deleteMany({}),
  ]);
  console.log('[seed] Colecciones limpiadas');
}

async function seedUsers() {
  const seeds = [
    { email: 'direccion@agencia.test', fullName: 'Ana Dirección', role: 'direccion' as const, password: 'direccion12345' },
    { email: 'ojeador@agencia.test', fullName: 'Pablo Ojeador', role: 'ojeador' as const, password: 'ojeador12345' },
    { email: 'productos@agencia.test', fullName: 'Lucía Productos', role: 'gestor_productos' as const, password: 'productos12345' },
  ];
  const users = [];
  for (const s of seeds) {
    const u = new User({ email: s.email, fullName: s.fullName, role: s.role, passwordHash: 'tmp' });
    await u.setPassword(s.password);
    await u.save();
    users.push(u);
  }
  console.log(`[seed] ${users.length} usuarios creados`);
  return users;
}

async function seedTours(scoutId: string) {
  const tours = [];
  for (const s of TOURS_SEED) {
    const stops = s.stops.map((stop) => {
      const start = new Date(s.startDate.getTime() + stop.daysOffset * 86400000);
      const end = new Date(start.getTime() + stop.daysDuration * 86400000);
      return {
        city: stop.city,
        region: stop.region,
        country: stop.country,
        lat: stop.lat,
        lng: stop.lng,
        startDate: start,
        endDate: end,
        tournamentName: stop.tournamentName,
      };
    });
    const t = await Tour.create({
      name: s.name,
      description: s.description,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.endDate < new Date() ? 'completada' : (s.startDate < new Date() ? 'en_curso' : 'planificada'),
      stops,
      responsibleScout: scoutId,
      pricePerKidEUR: s.pricePerKidEUR,
    });
    tours.push({ doc: t, seed: s });
  }
  console.log(`[seed] ${tours.length} tours creados`);
  return tours;
}

async function seedKidsForTours(tours: Awaited<ReturnType<typeof seedTours>>, scoutId: string) {
  const allKids = [];
  for (const { doc, seed } of tours) {
    const kids = [];
    for (let i = 0; i < seed.kidsCount; i++) {
      const stopIdx = randomInt(0, doc.stops.length - 1);
      const stop = doc.stops[stopIdx];
      const isUSA = stop.country === 'USA';
      // distribuye rating alrededor del objetivo con ruido gaussiano simple
      const ratingNoise = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
      const rating = Math.max(1, Math.min(10, seed.avgRatingTarget + ratingNoise * 3));
      const status: 'prospecto' | 'en_seguimiento' | 'contactado' | 'firmado' =
        rating >= 8 ? 'firmado' : rating >= 6.5 ? 'contactado' : rating >= 5 ? 'en_seguimiento' : 'prospecto';

      const firstName = randomItem(FIRST_NAMES_KID);
      const last1 = randomItem(LAST_NAMES);
      const last2 = randomItem(LAST_NAMES);
      const slug = `${firstName}.${last1}`.toLowerCase().replace(/[^a-z.]/g, '');
      const birthYear = randomInt(2009, 2013); // 12-16 años en 2025
      const ageGroup = 2025 - birthYear <= 14 ? 'sub15' : 'sub17';
      const guardianFirst = randomItem(GUARDIAN_FIRST);
      const guardianRelation = randomItem(GUARDIAN_RELATIONS);

      // Métricas correlacionadas con rating (mejor rating = mejor sprint, mejor cooper)
      const sprint = 6.5 - (rating - 5) * 0.15 + (Math.random() - 0.5) * 0.4;
      const cooper = 2.3 + (rating - 5) * 0.18 + (Math.random() - 0.5) * 0.3;

      kids.push({
        fullName: `${firstName} ${last1} ${last2}`,
        birthDate: new Date(birthYear, randomInt(0, 11), randomInt(1, 28)),
        nationality: isUSA ? randomItem(['USA', 'México', 'Brasil', 'Argentina']) : 'España',
        documentId: isUSA ? `US${randomInt(10000000, 99999999)}` : `${randomInt(10000000, 99999999)}${'TRWAGMYFPDXBNJZSQVHLCKE'[randomInt(0, 22)]}`,

        email: status !== 'prospecto' ? `${slug}${i}@example.com` : undefined,
        phone: status === 'firmado' || status === 'contactado' ? `+1 555-${randomInt(1000, 9999)}` : undefined,
        addressCity: stop.city,
        addressCountry: stop.country,
        languages: isUSA ? randomSample(LANGUAGES_POOL_USA, randomInt(1, 2)) : randomSample(LANGUAGES_POOL_ES, randomInt(1, 3)),

        guardianName: `${guardianFirst} ${last1}`,
        guardianRelation,
        guardianPhone: `+${isUSA ? '1' : '34'} ${randomInt(600, 999)} ${randomInt(100, 999)} ${randomInt(100, 999)}`,
        guardianEmail: `${guardianFirst.toLowerCase()}.${last1.toLowerCase()}@example.com`,

        educationLevel: randomItem([...EDUCATION_LEVELS]),
        schoolName: `${stop.city} ${randomItem(['Middle School', 'High School', 'Academy', 'Sports Academy'])}`,

        heightCm: randomInt(150, 185),
        weightKg: randomInt(45, 75),
        preferredFoot: randomItem(['izquierdo', 'derecho', 'ambidiestro'] as const),

        position: randomItem(POSITIONS),
        secondaryPositions: Math.random() < 0.6 ? [randomItem(POSITIONS)] : [],
        yearsPlaying: randomInt(3, 10),
        currentClub: `${stop.city} Youth Academy`,
        jerseyNumber: randomInt(1, 30),
        isCaptain: Math.random() < 0.15,
        matchesPlayed: randomInt(15, 60),
        goalsScored: randomInt(0, 30),
        assists: randomInt(0, 20),
        sprint40mSeconds: Math.round(sprint * 100) / 100,
        cooperTestKm: Math.round(cooper * 100) / 100,

        bloodType: randomItem([...BLOOD_TYPES]),
        allergies: Math.random() < 0.3 ? randomSample(ALLERGIES_POOL, randomInt(1, 2)) : [],
        injuries: randomItem(INJURIES_TEMPLATES),
        lastMedicalCheckDate: randomDate(new Date(2024, 0, 1), new Date(2025, 6, 1)),

        marketValueEUR: 0,
        signedAt: status === 'firmado' ? randomDate(new Date(2024, 6, 1), new Date(2025, 8, 1)) : undefined,
        contractEndsAt: status === 'firmado' ? randomDate(new Date(2026, 0, 1), new Date(2028, 11, 31)) : undefined,
        agreedFeeEUR: status === 'firmado' ? randomInt(2000, 15000) : undefined,

        status,
        tags: ['niño', ageGroup],
        notes: `Descubierto en ${stop.tournamentName} (${stop.city}).`,
        discoveredAtTour: doc._id,
        discoveredAtStopIdx: stopIdx,
        averageRating: Math.round(rating * 10) / 10,
        createdBy: scoutId,
      });
    }
    const created = await Athlete.insertMany(kids);
    allKids.push({ tour: doc, seed, kids: created });
  }
  const totalKids = allKids.reduce((acc, t) => acc + t.kids.length, 0);
  console.log(`[seed] ${totalKids} niños descubiertos en tours`);
  return allKids;
}

function randomSample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function seedClients() {
  const docs = [
    { name: 'Nike Iberia', type: 'marca' as const, country: 'España', industry: 'Equipamiento deportivo' },
    { name: 'Adidas Sport', type: 'marca' as const, country: 'Alemania', industry: 'Equipamiento deportivo' },
    { name: 'Red Bull España', type: 'marca' as const, country: 'España', industry: 'Bebidas' },
    { name: 'CF Talavera', type: 'club' as const, country: 'España', industry: 'Fútbol' },
    { name: 'LA Galaxy Academy', type: 'club' as const, country: 'USA', industry: 'Fútbol' },
    { name: 'AS Diario', type: 'medio' as const, country: 'España', industry: 'Medios deportivos' },
    { name: 'Fundación LaLiga', type: 'institucion' as const, country: 'España', industry: 'Institución deportiva' },
  ];
  const created = await Client.insertMany(docs);
  console.log(`[seed] ${created.length} clientes creados`);
  return created;
}

async function seedProducts() {
  const docs = [
    { name: 'Tour de scouting internacional', category: 'representacion' as const, basePriceEUR: 50000, unitsSold: 4, revenueEUR: 200000 },
    { name: 'Gestión integral de patrocinios', category: 'patrocinio' as const, basePriceEUR: 15000, unitsSold: 24, revenueEUR: 360000 },
    { name: 'Organización de torneos benéficos', category: 'organizacion_eventos' as const, basePriceEUR: 40000, unitsSold: 5, revenueEUR: 200000 },
    { name: 'Camp de alto rendimiento para niños', category: 'organizacion_eventos' as const, basePriceEUR: 8000, unitsSold: 18, revenueEUR: 144000 },
    { name: 'Plan de comunicación 360º', category: 'comunicacion' as const, basePriceEUR: 12000, unitsSold: 18, revenueEUR: 216000 },
    { name: 'Estrategia marketing digital', category: 'marketing_digital' as const, basePriceEUR: 8000, unitsSold: 30, revenueEUR: 240000 },
    { name: 'Consultoría estratégica deportiva', category: 'consultoria' as const, basePriceEUR: 20000, unitsSold: 8, revenueEUR: 160000 },
  ];
  const created = await Product.insertMany(docs);
  console.log(`[seed] ${created.length} productos creados`);
  return created;
}

async function seedEventsFromTours(
  toursWithKids: Awaited<ReturnType<typeof seedKidsForTours>>,
  clientIds: string[]
) {
  const events = [];
  for (const { tour, seed, kids } of toursWithKids) {
    // Elige cuántos niños participan basándose en la conversión objetivo del tour.
    const targetCount = Math.round(kids.length * seed.conversionTarget);
    // Selecciona los mejores (mayor rating)
    const sorted = [...kids].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    const invited = sorted.slice(0, targetCount);

    // Crea un evento "Camp" tras cada tour
    const startEvent = new Date(tour.endDate.getTime() + 45 * 86400000);
    const event = await Event.create({
      title: `Camp post-${tour.name}`,
      type: 'activacion',
      startDate: startEvent,
      endDate: new Date(startEvent.getTime() + 7 * 86400000),
      location: tour.stops[tour.stops.length - 1].city,
      client: randomItem(clientIds),
      participatingAthletes: invited.map((k) => k._id),
      budgetEUR: 30000 + targetCount * 500,
      actualCostEUR: 28000 + targetCount * 450,
      description: `Camp de alto rendimiento al que se invitó a los ${targetCount} mejores niños del ${tour.name}.`,
    });
    events.push(event);
  }
  console.log(`[seed] ${events.length} eventos derivados de tours creados`);
  return events;
}

async function seedExtraEvents(clientIds: string[], athleteIds: string[]) {
  const docs = [];
  for (let i = 0; i < 4; i++) {
    const start = randomDate(new Date(2025, 0, 1), new Date(2026, 5, 1));
    docs.push({
      title: `Evento ${randomItem(['Gala', 'Torneo benéfico', 'Activación marca', 'Presentación'])} ${i + 1}`,
      type: randomItem(['partido', 'torneo', 'rueda_prensa', 'campana'] as const),
      startDate: start,
      endDate: new Date(start.getTime() + 86400000 * randomInt(1, 3)),
      location: randomItem(['Madrid', 'Los Angeles', 'Miami', 'Houston', 'Sevilla']),
      client: randomItem(clientIds),
      participatingAthletes: Array.from({ length: randomInt(1, 3) }, () => randomItem(athleteIds)),
      budgetEUR: randomInt(10000, 100000),
      actualCostEUR: randomInt(8000, 95000),
    });
  }
  const created = await Event.insertMany(docs);
  console.log(`[seed] ${created.length} eventos extra creados`);
  return created;
}

async function seedSponsorships(clientIds: string[], athleteIds: string[], eventIds: string[]) {
  const docs = [];
  for (let i = 0; i < 18; i++) {
    const start = randomDate(new Date(2024, 0, 1), new Date(2026, 0, 1));
    docs.push({
      client: randomItem(clientIds),
      athlete: Math.random() > 0.5 ? randomItem(athleteIds) : undefined,
      event: Math.random() > 0.4 ? randomItem(eventIds) : undefined,
      amountEUR: randomInt(5000, 250000),
      startDate: start,
      endDate: new Date(start.getTime() + 86400000 * 365),
      status: randomItem(['borrador', 'negociacion', 'activo', 'finalizado'] as const),
    });
  }
  const created = await Sponsorship.insertMany(docs);
  console.log(`[seed] ${created.length} patrocinios creados`);
  return created;
}

async function seedScoutingRoutes(scoutId: string, athleteIds: string[]) {
  const docs = [];
  for (let i = 0; i < 12; i++) {
    const startedAt = randomDate(new Date(2024, 6, 1), new Date(2026, 4, 1));
    const stagesCount = randomInt(1, 4);
    const stages = [];
    for (let s = 0; s < stagesCount; s++) {
      stages.push({
        date: new Date(startedAt.getTime() + 86400000 * 14 * s),
        location: randomItem(['Estadio Municipal', 'Ciudad Deportiva', 'Campo Anexo', 'Estadio Central']),
        observations: 'Observación de partido. Buena visión de juego.',
        ratingOverall: randomInt(5, 10),
        ratingTechnical: randomInt(5, 10),
        ratingPhysical: randomInt(5, 10),
        ratingTactical: randomInt(5, 10),
        ratingMental: randomInt(5, 10),
        status: randomItem(['planificado', 'en_curso', 'completado'] as const),
      });
    }
    docs.push({
      athlete: randomItem(athleteIds),
      scout: scoutId,
      startedAt,
      outcome: randomItem(['abierta', 'firmado', 'descartado'] as const),
      stages,
    });
  }
  const created = await ScoutingRoute.insertMany(docs);
  console.log(`[seed] ${created.length} rutas de captación 1-a-1 creadas`);
  return created;
}

async function main(): Promise<void> {
  await connectDB();
  console.log('[seed] ⚠️  Vas a borrar todos los datos existentes en la BD.');
  await clearAll();

  const users = await seedUsers();
  const scout = users.find((u) => u.role === 'ojeador')!;

  const tours = await seedTours(scout.id);
  const toursWithKids = await seedKidsForTours(tours, scout.id);
  const clients = await seedClients();
  await seedProducts();

  const allKidIds = toursWithKids.flatMap((t) => t.kids.map((k) => String(k._id)));
  const clientIds = clients.map((c) => String(c.id));

  const tourEvents = await seedEventsFromTours(toursWithKids, clientIds);
  const extraEvents = await seedExtraEvents(clientIds, allKidIds);
  const allEventIds = [...tourEvents, ...extraEvents].map((e) => String(e.id));

  await seedSponsorships(clientIds, allKidIds, allEventIds);
  await seedScoutingRoutes(scout.id, allKidIds);

  await disconnectDB();
  console.log('[seed] ✅ Datos de ejemplo generados correctamente');
  console.log('[seed] Login con:');
  console.log('[seed]  - direccion@agencia.test / direccion12345');
  console.log('[seed]  - ojeador@agencia.test / ojeador12345');
  console.log('[seed]  - productos@agencia.test / productos12345');
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[seed] Error:', err);
  await disconnectDB();
  process.exit(1);
});
