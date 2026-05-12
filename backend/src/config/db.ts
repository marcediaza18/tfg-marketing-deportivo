import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(uri: string = env.mongoUri): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`[db] Conectado a MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('[db] Desconectado de MongoDB');
}
