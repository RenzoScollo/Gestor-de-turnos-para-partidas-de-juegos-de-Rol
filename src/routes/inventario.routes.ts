import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { InventarioService } from '../services/inventario.service';
import { EntityManager } from '@mikro-orm/core';
import { validate } from '../middlewares/validate';
import {
  crearInventarioSchema,
  actualizarInventarioSchema,
  inventarioParamsSchema,
} from '../schemas/inventario.schema';

export function crearInventarioRouter(em: EntityManager): Router {
  const router = Router();

  const inventarioService = new InventarioService(em);
  const inventarioController = new InventarioController(inventarioService);

  router.get('/', (req, res) => inventarioController.obtenerTodos(req, res));
  router.get(
    '/:idPersonaje/:numInventario',
    validate({ schema: inventarioParamsSchema, ubicacion: 'params' }),
    (req, res) => inventarioController.obtenerPorClave(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearInventarioSchema }),
    (req, res) => inventarioController.crear(req, res)
  );
  router.put(
    '/:idPersonaje/:numInventario',
    validate({ schema: inventarioParamsSchema, ubicacion: 'params' }),
    validate({ schema: actualizarInventarioSchema }),
    (req, res) => inventarioController.actualizar(req, res)
  );
  router.delete(
    '/:idPersonaje/:numInventario',
    validate({ schema: inventarioParamsSchema, ubicacion: 'params' }),
    (req, res) => inventarioController.eliminar(req, res)
  );

  return router;
}
