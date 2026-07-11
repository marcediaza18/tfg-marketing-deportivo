import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createUser } from './helpers';

const app = createApp();

describe('CRUD de deportistas y validación', () => {
  let token: string;

  beforeEach(async () => {
    const { email, password } = await createUser('direccion');
    const res = await request(app).post('/api/auth/login').send({ email, password });
    token = res.body.token;
  });

  it('crea, consulta, actualiza y elimina un deportista', async () => {
    // Crear
    const created = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Ciclo Completo', position: 'delantero', averageRating: 7.5 });
    expect(created.status).toBe(201);
    const id = created.body._id;

    // Consultar
    const got = await request(app).get(`/api/athletes/${id}`).set('Authorization', `Bearer ${token}`);
    expect(got.status).toBe(200);
    expect(got.body.fullName).toBe('Ciclo Completo');

    // Actualizar
    const updated = await request(app)
      .put(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'firmado' });
    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('firmado');

    // Eliminar
    const removed = await request(app)
      .delete(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(204);

    // Ya no existe
    const gone = await request(app).get(`/api/athletes/${id}`).set('Authorization', `Bearer ${token}`);
    expect(gone.status).toBe(404);
  });

  it('rechaza un deportista sin nombre (validación Zod)', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${token}`)
      .send({ position: 'portero' });
    expect(res.status).toBe(400);
  });

  it('rechaza un rating fuera del rango 0-10', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Rating Malo', averageRating: 15 });
    expect(res.status).toBe(400);
  });

  it('devuelve 400 ante un identificador con formato inválido', async () => {
    const res = await request(app)
      .get('/api/athletes/no-es-un-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('filtra deportistas por estado', async () => {
    await request(app).post('/api/athletes').set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Firmado A', status: 'firmado' });
    await request(app).post('/api/athletes').set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Prospecto B', status: 'prospecto' });

    const res = await request(app)
      .get('/api/athletes?status=firmado')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items.every((a: { status: string }) => a.status === 'firmado')).toBe(true);
  });
});
