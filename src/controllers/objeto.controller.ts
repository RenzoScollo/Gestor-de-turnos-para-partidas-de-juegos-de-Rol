import { type Request, type Response } from 'express';
import { ObjetoService } from '../services/objeto.service';

export class ObjetoController {
  private objetoService: ObjetoService;

  constructor(objetoService: ObjetoService) {
    this.objetoService = objetoService;
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const objetos = await this.objetoService.obtenerTodos();
      res.json(objetos);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener objetos' });
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const objeto = await this.objetoService.obtenerPorId(id);

      if (!objeto) {
        return res.status(404).json({ message: 'Objeto no encontrado' });
      }

      res.json(objeto);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el objeto' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevo = await this.objetoService.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el objeto' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const actualizado = await this.objetoService.actualizar(id, req.body);

      if (!actualizado) {
        return res.status(404).json({ message: 'Objeto no encontrado para actualizar' });
      }

      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el objeto' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const eliminado = await this.objetoService.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ message: 'Objeto no encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el objeto' });
    }
  }
}
