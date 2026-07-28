import { Router } from 'express';
import { ClaseController } from '../controllers/clase.controller';
import { ClaseService } from '../services/clase.service';
import { EntityManager } from '@mikro-orm/core';
import { validate, idParamSchema } from '../middlewares/validate';
import { crearClaseSchema, actualizarClaseSchema } from '../schemas/clase.schema';

export function crearClaseRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const claseService = new ClaseService(em);
  const claseController = new ClaseController(claseService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => claseController.obtenerTodos(req, res));
  router.get(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => claseController.obtenerPorId(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearClaseSchema }),
    (req, res) => claseController.crear(req, res)
  );
  router.put(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    validate({ schema: actualizarClaseSchema }),
    (req, res) => claseController.actualizar(req, res)
  );
  router.delete(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => claseController.eliminar(req, res)
  );

  return router;
}
