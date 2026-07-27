import { type Request, type Response } from 'express';
import { PartidaService } from '../services/partida.service';

export class PartidaController {
  private partidaService: PartidaService;

  constructor(partidaService: PartidaService) {
    this.partidaService = partidaService;
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const partidas = await this.partidaService.obtenerTodos();
      res.json(partidas);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener partidas' });
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const partida = await this.partidaService.obtenerPorId(id);

      if (!partida) {
        return res.status(404).json({ message: 'Partida no encontrada' });
      }

      res.json(partida);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la partida' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevaPartida = await this.partidaService.crear(req.body);
      res.status(201).json(nuevaPartida);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la partida' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const partidaActualizada = await this.partidaService.actualizar(id, req.body);

      if (!partidaActualizada) {
        return res.status(404).json({ message: 'Partida no encontrada para actualizar' });
      }

      res.json(partidaActualizada);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la partida' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const eliminada = await this.partidaService.eliminar(id);

      if (!eliminada) {
        return res.status(404).json({ message: 'Partida no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la partida' });
    }
  }
}
