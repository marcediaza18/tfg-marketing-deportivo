import 'express-async-errors';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

/**
 * Construye la aplicación Express con toda su cadena de middleware, pero sin
 * ponerla a escuchar. Separar la construcción del arranque permite montar la
 * app en las pruebas automatizadas sin abrir un puerto real.
 */
export function createApp(): Express {
  const app = express();

  // Cabeceras de seguridad (CSP, X-Frame-Options, etc.).
  app.use(helmet());

  // Solo se acepta el origen del frontend configurado.
  app.use(cors({ origin: env.clientOrigin, credentials: true }));

  // Límite de tamaño del cuerpo para mitigar cargas maliciosas.
  app.use(express.json({ limit: '1mb' }));

  // Neutraliza operadores de MongoDB ($, .) en las entradas para prevenir
  // inyección NoSQL.
  app.use(mongoSanitize());

  app.use(morgan(env.nodeEnv === 'test' ? 'tiny' : env.nodeEnv === 'production' ? 'combined' : 'dev'));

  // Limitación de intentos de inicio de sesión: 10 por IP cada 15 minutos.
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos de inicio de sesión. Inténtalo más tarde.' },
    skip: () => env.nodeEnv === 'test',
  });
  app.use('/api/auth/login', loginLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.nodeEnv, timestamp: new Date().toISOString() });
  });

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
