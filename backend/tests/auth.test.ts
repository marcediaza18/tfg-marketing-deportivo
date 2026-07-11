import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { createUser } from './helpers';

const app = createApp();

describe('Autenticación', () => {
  it('registra un usuario nuevo y devuelve token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'nuevo@test.local',
      password: 'password12345',
      fullName: 'Usuario Nuevo',
      role: 'ojeador',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined(); // no se filtra el hash
  });

  it('rechaza el registro con email duplicado', async () => {
    await createUser('ojeador');
    const res = await request(app).post('/api/auth/register').send({
      email: 'ojeador@test.local',
      password: 'password12345',
      fullName: 'Duplicado',
    });
    expect(res.status).toBe(409);
  });

  it('rechaza contraseñas demasiado cortas', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'corto@test.local',
      password: '123',
      fullName: 'Corto',
    });
    expect(res.status).toBe(400);
  });

  it('permite iniciar sesión con credenciales correctas', async () => {
    const { email, password } = await createUser('direccion');
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rechaza credenciales incorrectas', async () => {
    const { email } = await createUser('direccion');
    const res = await request(app).post('/api/auth/login').send({ email, password: 'incorrecta' });
    expect(res.status).toBe(401);
  });

  it('rechaza el acceso sin token', async () => {
    const res = await request(app).get('/api/athletes');
    expect(res.status).toBe(401);
  });

  it('rechaza un token manipulado o inválido', async () => {
    const res = await request(app)
      .get('/api/athletes')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.status).toBe(401);
  });

  it('rechaza un token caducado', async () => {
    const { user } = await createUser('ojeador');
    const expired = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: -10 }
    );
    const res = await request(app).get('/api/athletes').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });
});
