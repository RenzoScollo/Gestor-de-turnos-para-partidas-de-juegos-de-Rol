import { Router } from 'express';
import { PersonajeSesionController } from '../controllers/personajeSesion.controller';
import { PersonajeSesionService } from '../services/personajeSesion.service';
import { EntityManager } from '@mikro-orm/core';

export function crearPersonajeSesionRouter(em: EntityManager): Router {
  const router = Router();

  const personajeSesionService = new PersonajeSesionService(em);
  const personajeSesionController = new PersonajeSesionController(personajeSesionService);

  // Clave compuesta triple: la URL lleva las tres partes
  router.get('/', (req, res) => personajeSesionController.obtenerTodos(req, res));
  router.get('/:idPersonaje/:idPartida/:numSesion', (req, res) => personajeSesionController.obtenerPorClave(req, res));
  router.post('/', (req, res) => personajeSesionController.crear(req, res));
  router.put('/:idPersonaje/:idPartida/:numSesion', (req, res) => personajeSesionController.actualizar(req, res));
  router.delete('/:idPersonaje/:idPartida/:numSesion', (req, res) => personajeSesionController.eliminar(req, res));

  return router;
}
