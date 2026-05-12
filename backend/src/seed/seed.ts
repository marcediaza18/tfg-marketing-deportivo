/**
 * Script de poblado de datos de ejemplo para el SI de marketing deportivo.
 *
 * Uso: npm run seed
 *
 * Genera usuarios con cada rol, deportistas (futbolistas) sintéticos,
 * clientes, productos, eventos, patrocinios y rutas de captación.
 * NO usar en producción.
 */
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Athlete } from '../models/Athlete';
import { Client } from '../models/Client';
import { Product } from '../models/Product';
import { Event } from '../models/Event';
import { Sponsorship } from '../models/Sponsorship';
import { ScoutingRoute } from '../models/ScoutingRoute';

const POSITIONS = ['portero', 'lateral_derecho', 'lateral_izquierdo', 'central', 'mediocentro_defensivo', 'mediocentro', 'mediocentro_ofensivo', 'extremo_derecho', 'extremo_izquierdo', 'delantero'];
const CLUBS = ['Real Madrid CF', 'FC Barcelona', 'Atlético de Madrid', 'Sevilla FC', 'Valencia CF', 'Real Sociedad', 'Athletic Club', 'Villarreal CF', 'Real Betis', 'CA Osasuna', 'CF Talavera', 'Albacete BP', 'Getafe CF', 'RCD Mallorca'];
const NATIONALITIES = ['España', 'Argentina', 'Brasil', 'Francia', 'Portugal', 'Uruguay', 'Marruecos', 'Senegal', 'Colombia', 'México'];
const STATUSES: Array<'prospecto' | 'en_seguimiento' | 'contactado' | 'firmado' | 'descartado'> = ['prospecto', 'en_seguimiento', 'contactado', 'firmado', 'descartado'];
const FIRST_NAMES = ['Javier', 'Carlos', 'Mateo', 'Lucas', 'Hugo', 'Adrián', 'Iván', 'Pablo', 'Sergio', 'Marco', 'Diego', 'Bruno', 'Álvaro', 'Daniel', 'Nicolás', 'David', 'Alejandro', 'Manuel'];
const LAST_NAMES = ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'González', 'Rodríguez', 'Fernández', 'Ruiz', 'Díaz', 'Moreno', 'Jiménez', 'Romero', 'Navarro', 'Torres'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function clearAll(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Athlete.deleteMany({}),
    Client.deleteMany({}),
    Product.deleteMany({}),
    Event.deleteMany({}),
    Sponsorship.deleteMany({}),
    ScoutingRoute.deleteMany({}),
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
  console.log('[seed]  - direccion@agencia.test / direccion12345 (rol: direccion)');
  console.log('[seed]  - ojeador@agencia.test / ojeador12345 (rol: ojeador)');
  console.log('[seed]  - productos@agencia.test / productos12345 (rol: gestor_productos)');
  return users;
}

async function seedAthletes(scoutId: string, n = 40) {
  const docs = [];
  for (let i = 0; i < n; i++) {
    docs.push({
      fullName: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)} ${randomItem(LAST_NAMES)}`,
      birthDate: randomDate(new Date(1998, 0, 1), new Date(2008, 0, 1)),
      nationality: randomItem(NATIONALITIES),
      position: randomItem(POSITIONS),
      preferredFoot: randomItem(['izquierdo', 'derecho', 'ambidiestro'] as const),
      heightCm: randomInt(165, 200),
      weightKg: randomInt(60, 95),
      currentClub: randomItem(CLUBS),
      marketValueEUR: randomInt(50_000, 25_000_000),
      status: randomItem(STATUSES),
      tags: [randomItem(['promesa', 'experimentado', 'lesión_reciente', 'sub21', 'cantera'])],
      createdBy: scoutId,
    });
  }
  const created = await Athlete.insertMany(docs);
  console.log(`[seed] ${created.length} deportistas creados`);
  return created;
}

async function seedClients() {
  const docs = [
    { name: 'Nike Iberia', type: 'marca' as const, country: 'España', industry: 'Equipamiento deportivo' },
    { name: 'Adidas Sport', type: 'marca' as const, country: 'Alemania', industry: 'Equipamiento deportivo' },
    { name: 'Red Bull España', type: 'marca' as const, country: 'España', industry: 'Bebidas' },
    { name: 'CF Talavera', type: 'club' as const, country: 'España', industry: 'Fútbol' },
    { name: 'AS Diario', type: 'medio' as const, country: 'España', industry: 'Medios deportivos' },
    { name: 'Fundación LaLiga', type: 'institucion' as const, country: 'España', industry: 'Institución deportiva' },
  ];
  const created = await Client.insertMany(docs);
  console.log(`[seed] ${created.length} clientes creados`);
  return created;
}

async function seedProducts() {
  const docs = [
    { name: 'Representación deportiva premium', category: 'representacion' as const, basePriceEUR: 25000, unitsSold: 12, revenueEUR: 300000 },
    { name: 'Gestión integral de patrocinios', category: 'patrocinio' as const, basePriceEUR: 15000, unitsSold: 24, revenueEUR: 360000 },
    { name: 'Organización de torneos benéficos', category: 'organizacion_eventos' as const, basePriceEUR: 40000, unitsSold: 5, revenueEUR: 200000 },
    { name: 'Plan de comunicación 360º', category: 'comunicacion' as const, basePriceEUR: 12000, unitsSold: 18, revenueEUR: 216000 },
    { name: 'Estrategia marketing digital', category: 'marketing_digital' as const, basePriceEUR: 8000, unitsSold: 30, revenueEUR: 240000 },
    { name: 'Consultoría estratégica deportiva', category: 'consultoria' as const, basePriceEUR: 20000, unitsSold: 8, revenueEUR: 160000 },
  ];
  const created = await Product.insertMany(docs);
  console.log(`[seed] ${created.length} productos creados`);
  return created;
}

async function seedEvents(clientIds: string[], athleteIds: string[]) {
  const docs = [];
  for (let i = 0; i < 10; i++) {
    const start = randomDate(new Date(2024, 0, 1), new Date(2026, 5, 1));
    docs.push({
      title: `Evento ${randomItem(['Gala', 'Torneo', 'Activación', 'Presentación'])} ${i + 1}`,
      type: randomItem(['partido', 'torneo', 'rueda_prensa', 'campana', 'activacion'] as const),
      startDate: start,
      endDate: new Date(start.getTime() + 86400000 * randomInt(1, 3)),
      location: randomItem(['Madrid', 'Barcelona', 'Talavera de la Reina', 'Sevilla', 'Valencia']),
      client: randomItem(clientIds),
      participatingAthletes: Array.from({ length: randomInt(1, 4) }, () => randomItem(athleteIds)),
      budgetEUR: randomInt(10000, 100000),
      actualCostEUR: randomInt(8000, 95000),
    });
  }
  const created = await Event.insertMany(docs);
  console.log(`[seed] ${created.length} eventos creados`);
  return created;
}

async function seedSponsorships(clientIds: string[], athleteIds: string[], eventIds: string[]) {
  const docs = [];
  for (let i = 0; i < 20; i++) {
    const start = randomDate(new Date(2024, 0, 1), new Date(2026, 0, 1));
    docs.push({
      client: randomItem(clientIds),
      athlete: Math.random() > 0.3 ? randomItem(athleteIds) : undefined,
      event: Math.random() > 0.5 ? randomItem(eventIds) : undefined,
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
  for (let i = 0; i < 15; i++) {
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
  console.log(`[seed] ${created.length} rutas de captación creadas`);
  return created;
}

async function main(): Promise<void> {
  await connectDB();
  console.log('[seed] ⚠️  Vas a borrar todos los datos existentes en la BD.');
  await clearAll();

  const users = await seedUsers();
  const scout = users.find((u) => u.role === 'ojeador')!;

  const athletes = await seedAthletes(scout.id);
  const clients = await seedClients();
  await seedProducts();
  const events = await seedEvents(clients.map((c) => c.id), athletes.map((a) => a.id));
  await seedSponsorships(
    clients.map((c) => c.id),
    athletes.map((a) => a.id),
    events.map((e) => e.id)
  );
  await seedScoutingRoutes(scout.id, athletes.map((a) => a.id));

  await disconnectDB();
  console.log('[seed] ✅ Datos de ejemplo generados correctamente');
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[seed] Error:', err);
  await disconnectDB();
  process.exit(1);
});
