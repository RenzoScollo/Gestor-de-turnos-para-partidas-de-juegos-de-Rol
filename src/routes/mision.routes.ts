import { Router } from 'express';
import { MisionController } from '../controllers/mision.controller';
import { MisionService } from '../services/mision.service';
import { EntityManager } from '@mikro-orm/core';
import { validate } from '../middlewares/validate';
import { crearMisionSchema, actualizarMisionSchema, misionParamsSchema } from '../schemas/mision.schema';

export function crearMisionRouter(em: EntityManager): Router {
  const router = Router();

  const misionService = new MisionService(em);
  const misionController = new MisionController(misionService);

  // Clave compuesta triple: la URL lleva las tres partes
  router.get('/', (req, res) => misionController.obtenerTodos(req, res));
  router.get(
    '/:idPartida/:numSesion/:numMision',
    validate({ schema: misionParamsSchema, ubicacion: 'params' }),
    (req, res) => misionController.obtenerPorClave(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearMisionSchema }),
    (req, res) => misionController.crear(req, res)
  );
  router.put(
    '/:idPartida/:numSesion/:numMision',
    validate({ schema: misionParamsSchema, ubicacion: 'params' }),
    validate({ schema: actualizarMisionSchema }),
    (req, res) => misionController.actualizar(req, res)
  );
  router.delete(
    '/:idPartida/:numSesion/:numMision',
    validate({ schema: misionParamsSchema, ubicacion: 'params' }),
    (req, res) => misionController.eliminar(req, res)
  );

  return router;
}
