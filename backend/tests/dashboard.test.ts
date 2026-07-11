import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createUser } from './helpers';

const app = createApp();

describe('Analítica del cuadro de mando', () => {
  let token: string;

  beforeEach(async () => {
    const { email, password } = await createUser('direccion');
    const res = await request(app).post('/api/auth/login').send({ email, password });
    token = res.body.token;
    // Sembrar algunos deportistas para las agregaciones.
    const seed: Array<[string, string]> = [
      ['Jugador Uno', 'firmado'],
      ['Jugador Dos', 'firmado'],
      ['Jugador Tres', 'prospecto'],
    ];
    for (const [name, status] of seed) {
      await request(app).post('/api/athletes').set('Authorization', `Bearer ${token}`)
        .send({ fullName: name, status, position: 'delantero' });
    }
  });

  it('el resumen devuelve los recuentos correctos', async () => {
    const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.counts.athletes).toBe(3);
  });

  it('agrega deportistas por estado', async () => {
    const res = await request(app)
      .get('/api/dashboard/athletes-by-status')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const firmado = res.body.find((d: { name: string; value: number }) => d.name === 'firmado');
    expect(firmado.value).toBe(2);
  });

  it('devuelve el rendimiento de tours sin errores aunque no haya tours', async () => {
    const res = await request(app)
      .get('/api/dashboard/tour-performance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
