import { beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Variables de entorno mínimas para que env.ts no falle al importarse.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_para_pruebas_automatizadas';
process.env.MONGO_URI = 'mongodb://placeholder';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

// Reutiliza el binario de MongoDB instalado en el sistema si existe, para
// evitar la descarga del binario que hace mongodb-memory-server por defecto.
const SYSTEM_MONGOD = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  process.env.MONGOMS_SYSTEM_BINARY = SYSTEM_MONGOD;
}

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  // Limpia todas las colecciones entre pruebas para aislarlas.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
