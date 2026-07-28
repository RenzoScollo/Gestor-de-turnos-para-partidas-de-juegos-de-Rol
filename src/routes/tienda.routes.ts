import { Router } from 'express';
import { TiendaController } from '../controllers/tienda.controller';
import { TiendaService } from '../services/tienda.service';
import { EntityManager } from '@mikro-orm/core';
import { validate, idParamSchema } from '../middlewares/validate';
import { crearTiendaSchema, actualizarTiendaSchema } from '../schemas/tienda.schema';

export function crearTiendaRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const tiendaService = new TiendaService(em);
  const tiendaController = new TiendaController(tiendaService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => tiendaController.obtenerTodos(req, res));
  router.get(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => tiendaController.obtenerPorId(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearTiendaSchema }),
    (req, res) => tiendaController.crear(req, res)
  );
  router.put(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    validate({ schema: actualizarTiendaSchema }),
    (req, res) => tiendaController.actualizar(req, res)
  );
  router.delete(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => tiendaController.eliminar(req, res)
  );

  return router;
}
