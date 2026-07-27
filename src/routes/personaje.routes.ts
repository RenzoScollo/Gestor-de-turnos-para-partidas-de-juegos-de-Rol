import { Router } from 'express';
import { PersonajeController } from '../controllers/personaje.controller';
import { PersonajeService } from '../services/personaje.service';
import { EntityManager } from '@mikro-orm/core';

export function crearPersonajeRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const personajeService = new PersonajeService(em);
  const personajeController = new PersonajeController(personajeService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => personajeController.obtenerTodos(req, res));
  router.get('/:id', (req, res) => personajeController.obtenerPorId(req, res));
  router.post('/', (req, res) => personajeController.crear(req, res));
  router.put('/:id', (req, res) => personajeController.actualizar(req, res));
  router.delete('/:id', (req, res) => personajeController.eliminar(req, res));

  return router;
}
