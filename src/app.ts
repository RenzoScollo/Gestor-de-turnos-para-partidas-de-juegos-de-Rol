// app.ts — Punto de entrada del backend.
// Inicializa MikroORM, arma Express y monta las rutas de la API.
// Uso: npm run dev (recarga sola) o npm start
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import { crearAuthRouter } from './routes/auth.routes';
import { autenticar, exigirRol } from './middlewares/auth.middleware';
import { crearUsuarioRouter } from './routes/usuario.routes';
import { crearClaseRouter } from './routes/clase.routes';
import { crearPartidaRouter } from './routes/partida.routes';
import { crearTiendaRouter } from './routes/tienda.routes';
import { crearPersonajeRouter } from './routes/personaje.routes';
import { crearObjetoRouter } from './routes/objeto.routes';
import { crearSesionRouter } from './routes/sesion.routes';
import { crearInventarioRouter } from './routes/inventario.routes';
import { crearMisionRouter } from './routes/mision.routes';
import { crearPersonajeSesionRouter } from './routes/personajeSesion.routes';

// En CommonJS no se puede usar await en el nivel superior, asi que todo
// el arranque va dentro de una funcion async.
async function main() {
  const orm = await MikroORM.init(config);

  const app = express();

  // Permite que el frontend (Vite, en otro puerto) llame a esta API.
  // Sin esto el navegador bloquea las peticiones por CORS.
  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));

  // Parsea el body JSON de los POST/PUT
  app.use(express.json());

  // Cada request trabaja con su propia copia (fork) del EntityManager.
  // Es el patron obligatorio de MikroORM para que dos requests en paralelo
  // no se pisen las entidades cargadas.
  app.use((req, res, next) => RequestContext.create(orm.em, next));

  // --- Autenticacion (publica: registro y login) ---
  app.use('/api/auth', crearAuthRouter(orm.em));

  // --- Rutas protegidas: hace falta estar logueado (token valido) ---
  // Ademas, las que administran el mundo del juego (clases, tiendas y
  // objetos del catalogo) exigen rol anfitrion: son los dos niveles de
  // acceso que pide la catedra.
  app.use('/api/usuarios', autenticar, crearUsuarioRouter(orm.em));
  app.use('/api/clases', autenticar, exigirRol('anfitrion'), crearClaseRouter(orm.em));
  app.use('/api/tiendas', autenticar, exigirRol('anfitrion'), crearTiendaRouter(orm.em));
  app.use('/api/objetos', autenticar, exigirRol('anfitrion'), crearObjetoRouter(orm.em));

  // El resto: cualquier usuario autenticado (jugador o anfitrion)
  app.use('/api/partidas', autenticar, crearPartidaRouter(orm.em));
  app.use('/api/personajes', autenticar, crearPersonajeRouter(orm.em));
  app.use('/api/sesiones', autenticar, crearSesionRouter(orm.em));
  app.use('/api/inventarios', autenticar, crearInventarioRouter(orm.em));
  app.use('/api/misiones', autenticar, crearMisionRouter(orm.em));
  app.use('/api/personaje-sesion', autenticar, crearPersonajeSesionRouter(orm.em));

  // Cualquier URL que no matchee ninguna ruta -> 404 en JSON
  app.use((req, res) => {
    res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}` });
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
    console.log(`Prueba: GET http://localhost:${port}/api/usuarios`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
