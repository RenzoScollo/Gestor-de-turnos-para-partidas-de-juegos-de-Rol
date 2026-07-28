import { Router } from 'express';
import { SesionController } from '../controllers/sesion.controller';
import { SesionService } from '../services/sesion.service';
import { EntityManager } from '@mikro-orm/core';
import { validate } from '../middlewares/validate';
import { crearSesionSchema, actualizarSesionSchema, sesionParamsSchema } from '../schemas/sesion.schema';

export function crearSesionRouter(em: EntityManager): Router {
  const router = Router();

  const sesionService = new SesionService(em);
  const sesionController = new SesionController(sesionService);

  // Clave compuesta: la URL lleva las dos partes (/idPartida/numSesion)
  router.get('/', (req, res) => sesionController.obtenerTodos(req, res));
  router.get(
    '/:idPartida/:numSesion',
    validate({ schema: sesionParamsSchema, ubicacion: 'params' }),
    (req, res) => sesionController.obtenerPorClave(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearSesionSchema }),
    (req, res) => sesionController.crear(req, res)
  );
  router.put(
    '/:idPartida/:numSesion',
    validate({ schema: sesionParamsSchema, ubicacion: 'params' }),
    validate({ schema: actualizarSesionSchema }),
    (req, res) => sesionController.actualizar(req, res)
  );
  router.delete(
    '/:idPartida/:numSesion',
    validate({ schema: sesionParamsSchema, ubicacion: 'params' }),
    (req, res) => sesionController.eliminar(req, res)
  );

  return router;
}
