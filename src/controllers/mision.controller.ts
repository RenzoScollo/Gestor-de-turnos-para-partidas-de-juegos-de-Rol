import { type Request, type Response } from 'express';
import { MisionService } from '../services/mision.service';

export class MisionController {
  private misionService: MisionService;

  constructor(misionService: MisionService) {
    this.misionService = misionService;
  }

  // Clave triple en la URL: /api/misiones/:idPartida/:numSesion/:numMision
  private claves(req: Request) {
    return {
      idPartida: parseInt(String(req.params.idPartida), 10),
      numSesion: parseInt(String(req.params.numSesion), 10),
      numMision: parseInt(String(req.params.numMision), 10),
    };
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const misiones = await this.misionService.obtenerTodos();
      res.json(misiones);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener misiones' });
    }
  }

  async obtenerPorClave(req: Request, res: Response) {
    try {
      const { idPartida, numSesion, numMision } = this.claves(req);
      const mision = await this.misionService.obtenerPorClave(idPartida, numSesion, numMision);

      if (!mision) {
        return res.status(404).json({ message: 'Mision no encontrada' });
      }

      res.json(mision);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la mision' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nueva = await this.misionService.crear(req.body);
      res.status(201).json(nueva);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la mision' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { idPartida, numSesion, numMision } = this.claves(req);
      const actualizada = await this.misionService.actualizar(idPartida, numSesion, numMision, req.body);

      if (!actualizada) {
        return res.status(404).json({ message: 'Mision no encontrada para actualizar' });
      }

      res.json(actualizada);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la mision' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { idPartida, numSesion, numMision } = this.claves(req);
      const eliminada = await this.misionService.eliminar(idPartida, numSesion, numMision);

      if (!eliminada) {
        return res.status(404).json({ message: 'Mision no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la mision' });
    }
  }
}
