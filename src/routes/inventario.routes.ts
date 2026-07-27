import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { InventarioService } from '../services/inventario.service';
import { EntityManager } from '@mikro-orm/core';

export function crearInventarioRouter(em: EntityManager): Router {
  const router = Router();

  const inventarioService = new InventarioService(em);
  const inventarioController = new InventarioController(inventarioService);

  router.get('/', (req, res) => inventarioController.obtenerTodos(req, res));
  router.get('/:idPersonaje/:numInventario', (req, res) => inventarioController.obtenerPorClave(req, res));
  router.post('/', (req, res) => inventarioController.crear(req, res));
  router.put('/:idPersonaje/:numInventario', (req, res) => inventarioController.actualizar(req, res));
  router.delete('/:idPersonaje/:numInventario', (req, res) => inventarioController.eliminar(req, res));

  return router;
}
