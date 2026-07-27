import { Router } from 'express';
import { MisionController } from '../controllers/mision.controller';
import { MisionService } from '../services/mision.service';
import { EntityManager } from '@mikro-orm/core';

export function crearMisionRouter(em: EntityManager): Router {
  const router = Router();

  const misionService = new MisionService(em);
  const misionController = new MisionController(misionService);

  // Clave compuesta triple: la URL lleva las tres partes
  router.get('/', (req, res) => misionController.obtenerTodos(req, res));
  router.get('/:idPartida/:numSesion/:numMision', (req, res) => misionController.obtenerPorClave(req, res));
  router.post('/', (req, res) => misionController.crear(req, res));
  router.put('/:idPartida/:numSesion/:numMision', (req, res) => misionController.actualizar(req, res));
  router.delete('/:idPartida/:numSesion/:numMision', (req, res) => misionController.eliminar(req, res));

  return router;
}
