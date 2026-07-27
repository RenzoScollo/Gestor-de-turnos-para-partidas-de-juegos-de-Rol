import { type Request, type Response } from 'express';
import { SesionService } from '../services/sesion.service';

export class SesionController {
  private sesionService: SesionService;

  constructor(sesionService: SesionService) {
    this.sesionService = sesionService;
  }

  // La clave compuesta viaja en la URL: /api/sesiones/:idPartida/:numSesion
  private claves(req: Request) {
    return {
      idPartida: parseInt(String(req.params.idPartida), 10),
      numSesion: parseInt(String(req.params.numSesion), 10),
    };
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const sesiones = await this.sesionService.obtenerTodos();
      res.json(sesiones);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener sesiones' });
    }
  }

  async obtenerPorClave(req: Request, res: Response) {
    try {
      const { idPartida, numSesion } = this.claves(req);
      const sesion = await this.sesionService.obtenerPorClave(idPartida, numSesion);

      if (!sesion) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      res.json(sesion);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la sesion' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nueva = await this.sesionService.crear(req.body);
      res.status(201).json(nueva);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la sesion' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { idPartida, numSesion } = this.claves(req);
      const actualizada = await this.sesionService.actualizar(idPartida, numSesion, req.body);

      if (!actualizada) {
        return res.status(404).json({ message: 'Sesion no encontrada para actualizar' });
      }

      res.json(actualizada);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la sesion' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { idPartida, numSesion } = this.claves(req);
      const eliminada = await this.sesionService.eliminar(idPartida, numSesion);

      if (!eliminada) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la sesion' });
    }
  }
}
