import { type Request, type Response } from 'express';
import { ClaseService } from '../services/clase.service';

export class ClaseController {
  private claseService: ClaseService;

  constructor(claseService: ClaseService) {
    this.claseService = claseService;
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const clases = await this.claseService.obtenerTodos();
      res.json(clases);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener clases' });
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const clase = await this.claseService.obtenerPorId(id);

      if (!clase) {
        return res.status(404).json({ message: 'Clase no encontrada' });
      }

      res.json(clase);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la clase' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevaClase = await this.claseService.crear(req.body);
      res.status(201).json(nuevaClase);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la clase' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const claseActualizada = await this.claseService.actualizar(id, req.body);

      if (!claseActualizada) {
        return res.status(404).json({ message: 'Clase no encontrada para actualizar' });
      }

      res.json(claseActualizada);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la clase' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const eliminada = await this.claseService.eliminar(id);

      if (!eliminada) {
        return res.status(404).json({ message: 'Clase no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la clase' });
    }
  }
}
