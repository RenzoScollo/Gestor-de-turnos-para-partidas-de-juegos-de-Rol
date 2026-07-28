import { Router } from 'express';
import { PartidaController } from '../controllers/partida.controller';
import { PartidaService } from '../services/partida.service';
import { EntityManager } from '@mikro-orm/core';
import { validate, idParamSchema } from '../middlewares/validate';
import { crearPartidaSchema, actualizarPartidaSchema } from '../schemas/partida.schema';

export function crearPartidaRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const partidaService = new PartidaService(em);
  const partidaController = new PartidaController(partidaService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => partidaController.obtenerTodos(req, res));
  router.get(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => partidaController.obtenerPorId(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearPartidaSchema }),
    (req, res) => partidaController.crear(req, res)
  );
  router.put(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    validate({ schema: actualizarPartidaSchema }),
    (req, res) => partidaController.actualizar(req, res)
  );
  router.delete(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => partidaController.eliminar(req, res)
  );

  return router;
}
