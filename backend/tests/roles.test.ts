import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createUser } from './helpers';

const app = createApp();

async function tokenFor(role: 'ojeador' | 'gestor_productos' | 'direccion') {
  const { email, password } = await createUser(role);
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token as string;
}

describe('Control de acceso por rol', () => {
  let ojeador: string;
  let gestor: string;
  let direccion: string;

  beforeEach(async () => {
    ojeador = await tokenFor('ojeador');
    gestor = await tokenFor('gestor_productos');
    direccion = await tokenFor('direccion');
  });

  it('el ojeador puede crear deportistas', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${ojeador}`)
      .send({ fullName: 'Jugador de prueba' });
    expect(res.status).toBe(201);
  });

  it('el gestor NO puede crear deportistas', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${gestor}`)
      .send({ fullName: 'Jugador de prueba' });
    expect(res.status).toBe(403);
  });

  it('el gestor puede crear clientes', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${gestor}`)
      .send({ name: 'Cliente de prueba' });
    expect(res.status).toBe(201);
  });

  it('el ojeador NO puede crear clientes', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${ojeador}`)
      .send({ name: 'Cliente de prueba' });
    expect(res.status).toBe(403);
  });

  it('solo dirección puede eliminar deportistas', async () => {
    const created = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${ojeador}`)
      .send({ fullName: 'Para borrar' });
    const id = created.body._id;

    const ojeadorTry = await request(app)
      .delete(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${ojeador}`);
    expect(ojeadorTry.status).toBe(403);

    const direccionTry = await request(app)
      .delete(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${direccion}`);
    expect(direccionTry.status).toBe(204);
  });

  it('todos los roles pueden consultar el listado de deportistas', async () => {
    for (const token of [ojeador, gestor, direccion]) {
      const res = await request(app).get('/api/athletes').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    }
  });
});
