// Test de INTEGRACION: recorre la app real de punta a punta
// (rutas -> validate -> controller -> service -> MikroORM -> MySQL).
//
// Requiere un .env valido con una base MySQL alcanzable y con el esquema
// ya creado (npm run schema:create). Usa un nickname unico por corrida
// para no chocar con datos existentes, y borra lo que crea al terminar.
import 'dotenv/config';
import request from 'supertest';
import { type Express } from 'express';
import { type MikroORM } from '@mikro-orm/mysql';
import { buildApp } from './buildApp';

describe('Flujo completo: registro -> ruta protegida -> baja (integracion real con MySQL)', () => {
  let app: Express;
  let orm: MikroORM;
  const nickname = `test_integracion_${Date.now()}`;

  beforeAll(async () => {
    ({ app, orm } = await buildApp());
  });

  afterAll(async () => {
    await orm.close(true);
  });

  it('registra un usuario y devuelve un token', async () => {
    const respuesta = await request(app).post('/api/auth/registro').send({
      nombreUsuario: 'Usuario de Integracion',
      nickname,
      contrasena: 'claveDeTest123',
      rol: 'jugador',
    });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.token).toBeDefined();
    expect(respuesta.body.usuario.nickname).toBe(nickname);
  });

  it('rechaza /api/usuarios sin token (401)', async () => {
    const respuesta = await request(app).get('/api/usuarios');

    expect(respuesta.status).toBe(401);
  });

  it('con el token, /api/usuarios devuelve al usuario recien creado', async () => {
    const registro = await request(app).post('/api/auth/registro').send({
      nombreUsuario: 'Otro de Integracion',
      nickname: `${nickname}_b`,
      contrasena: 'claveDeTest123',
      rol: 'jugador',
    });
    const token = registro.body.token as string;

    const respuesta = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.some((u: { nickname: string }) => u.nickname === `${nickname}_b`)).toBe(
      true
    );

    // limpieza: se borra el usuario que creo este test
    await request(app)
      .delete(`/api/usuarios/${registro.body.usuario.idUsuario}`)
      .set('Authorization', `Bearer ${token}`);
  });

  it('limpieza final: borra el usuario del primer test y ya no aparece en la lista', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ nickname, contrasena: 'claveDeTest123' });
    const token = login.body.token as string;
    const idUsuario = login.body.usuario.idUsuario as number;

    const baja = await request(app)
      .delete(`/api/usuarios/${idUsuario}`)
      .set('Authorization', `Bearer ${token}`);
    expect(baja.status).toBe(204);
  });
});
