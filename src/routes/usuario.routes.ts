import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService } from '../services/usuario.service';
import { EntityManager } from '@mikro-orm/core';
import { validate, idParamSchema } from '../middlewares/validate';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/usuario.schema';

export function crearUsuarioRouter(em: EntityManager): Router {
  const router = Router();

  // Instanciamos las capas inyectando las dependencias
  const usuarioService = new UsuarioService(em);
  const usuarioController = new UsuarioController(usuarioService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => usuarioController.obtenerTodos(req, res));
  router.get(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => usuarioController.obtenerPorId(req, res)
  );
  router.post(
    '/',
    validate({ schema: crearUsuarioSchema }),
    (req, res) => usuarioController.crearUsuario(req, res)
  );
  router.put(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    validate({ schema: actualizarUsuarioSchema }),
    (req, res) => usuarioController.actualizarUsuario(req, res)
  );
  router.delete(
    '/:id',
    validate({ schema: idParamSchema, ubicacion: 'params' }),
    (req, res) => usuarioController.eliminarUsuario(req, res)
  );

  return router;
}
