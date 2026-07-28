import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { autenticar } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { registroSchema, loginSchema } from '../schemas/auth.schema';

export function crearAuthRouter(em: EntityManager): Router {
  const router = Router();

  const authService = new AuthService(em);
  const authController = new AuthController(authService);

  // Rutas publicas
  router.post(
    '/registro',
    validate({ schema: registroSchema }),
    (req, res) => authController.registrar(req, res)
  );
  router.post(
    '/login',
    validate({ schema: loginSchema }),
    (req, res) => authController.login(req, res)
  );

  // Ruta protegida: hay que mandar el header Authorization: Bearer <token>
  router.get('/perfil', autenticar, (req, res) => authController.perfil(req, res));

  return router;
}
