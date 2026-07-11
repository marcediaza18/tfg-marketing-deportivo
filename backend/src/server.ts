import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`[server] API escuchando en http://localhost:${env.port}`);
    console.log(`[server] CORS permitido para: ${env.clientOrigin}`);
  });
}

bootstrap().catch((err) => {
  console.error('[fatal] No se pudo arrancar el servidor:', err);
  process.exit(1);
});
