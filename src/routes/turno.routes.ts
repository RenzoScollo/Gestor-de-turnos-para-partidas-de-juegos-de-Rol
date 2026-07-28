import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { TurnoController } from '../controllers/turno.controller';
import { TurnoService } from '../services/turno.service';
import { validate } from '../middlewares/validate';
import { sesionParamsSchema } from '../schemas/sesion.schema';

// Se monta con mergeParams:true para heredar :idPartida/:numSesion del
// prefijo con el que se registra en app.ts (/api/sesiones/:idPartida/:numSesion/turno).
export function crearTurnoRouter(em: EntityManager): Router {
  const router = Router({ mergeParams: true });

  const turnoService = new TurnoService(em);
  const turnoController = new TurnoController(turnoService);

  const validarClaves = validate({ schema: sesionParamsSchema, ubicacion: 'params' });

  router.get('/', validarClaves, (req, res) => turnoController.obtener(req, res));
  router.post('/iniciar', validarClaves, (req, res) => turnoController.iniciar(req, res));
  router.post('/avanzar', validarClaves, (req, res) => turnoController.avanzar(req, res));

  return router;
}
