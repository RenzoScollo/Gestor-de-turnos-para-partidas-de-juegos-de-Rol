// app.ts — Punto de entrada del backend.
// Inicializa MikroORM, arma Express y monta las rutas de la API.
// Uso: npm run dev (recarga sola) o npm start
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
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

  // Parsea el body JSON de los POST/PUT
  app.use(express.json());

  // Cada request trabaja con su propia copia (fork) del EntityManager.
  // Es el patron obligatorio de MikroORM para que dos requests en paralelo
  // no se pisen las entidades cargadas.
  app.use((req, res, next) => RequestContext.create(orm.em, next));

  // Rutas de la API — un router por entidad del modelo
  app.use('/api/usuarios', crearUsuarioRouter(orm.em));
  app.use('/api/clases', crearClaseRouter(orm.em));
  app.use('/api/partidas', crearPartidaRouter(orm.em));
  app.use('/api/tiendas', crearTiendaRouter(orm.em));
  app.use('/api/personajes', crearPersonajeRouter(orm.em));
  app.use('/api/objetos', crearObjetoRouter(orm.em));
  app.use('/api/sesiones', crearSesionRouter(orm.em));
  app.use('/api/inventarios', crearInventarioRouter(orm.em));
  app.use('/api/misiones', crearMisionRouter(orm.em));
  app.use('/api/personaje-sesion', crearPersonajeSesionRouter(orm.em));

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
