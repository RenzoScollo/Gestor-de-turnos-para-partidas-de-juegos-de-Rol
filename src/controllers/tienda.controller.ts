import { type Request, type Response } from 'express';
import { TiendaService } from '../services/tienda.service';

export class TiendaController {
  private tiendaService: TiendaService;

  constructor(tiendaService: TiendaService) {
    this.tiendaService = tiendaService;
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const tiendas = await this.tiendaService.obtenerTodos();
      res.json(tiendas);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener tiendas' });
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const tienda = await this.tiendaService.obtenerPorId(id);

      if (!tienda) {
        return res.status(404).json({ message: 'Tienda no encontrada' });
      }

      res.json(tienda);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la tienda' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevo = await this.tiendaService.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la tienda' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const actualizado = await this.tiendaService.actualizar(id, req.body);

      if (!actualizado) {
        return res.status(404).json({ message: 'Tienda no encontrada para actualizar' });
      }

      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la tienda' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const eliminado = await this.tiendaService.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ message: 'Tienda no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la tienda' });
    }
  }
}
