import { Router } from 'express';
import { TiendaController } from '../controllers/tienda.controller';
import { TiendaService } from '../services/tienda.service';
import { EntityManager } from '@mikro-orm/core';

export function crearTiendaRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const tiendaService = new TiendaService(em);
  const tiendaController = new TiendaController(tiendaService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => tiendaController.obtenerTodos(req, res));
  router.get('/:id', (req, res) => tiendaController.obtenerPorId(req, res));
  router.post('/', (req, res) => tiendaController.crear(req, res));
  router.put('/:id', (req, res) => tiendaController.actualizar(req, res));
  router.delete('/:id', (req, res) => tiendaController.eliminar(req, res));

  return router;
}
