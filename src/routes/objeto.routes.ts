import { Router } from 'express';
import { ObjetoController } from '../controllers/objeto.controller';
import { ObjetoService } from '../services/objeto.service';
import { EntityManager } from '@mikro-orm/core';

export function crearObjetoRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const objetoService = new ObjetoService(em);
  const objetoController = new ObjetoController(objetoService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => objetoController.obtenerTodos(req, res));
  router.get('/:id', (req, res) => objetoController.obtenerPorId(req, res));
  router.post('/', (req, res) => objetoController.crear(req, res));
  router.put('/:id', (req, res) => objetoController.actualizar(req, res));
  router.delete('/:id', (req, res) => objetoController.eliminar(req, res));

  return router;
}
