import { Router } from 'express';
import { PartidaController } from '../controllers/partida.controller';
import { PartidaService } from '../services/partida.service';
import { EntityManager } from '@mikro-orm/core';

export function crearPartidaRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const partidaService = new PartidaService(em);
  const partidaController = new PartidaController(partidaService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => partidaController.obtenerTodos(req, res));
  router.get('/:id', (req, res) => partidaController.obtenerPorId(req, res));
  router.post('/', (req, res) => partidaController.crear(req, res));
  router.put('/:id', (req, res) => partidaController.actualizar(req, res));
  router.delete('/:id', (req, res) => partidaController.eliminar(req, res));

  return router;
}
