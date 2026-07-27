import { type Request, type Response } from 'express';
import { InventarioService } from '../services/inventario.service';

export class InventarioController {
  private inventarioService: InventarioService;

  constructor(inventarioService: InventarioService) {
    this.inventarioService = inventarioService;
  }

  // Clave compuesta en la URL: /api/inventarios/:idPersonaje/:numInventario
  private claves(req: Request) {
    return {
      idPersonaje: parseInt(String(req.params.idPersonaje), 10),
      numInventario: parseInt(String(req.params.numInventario), 10),
    };
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const inventarios = await this.inventarioService.obtenerTodos();
      res.json(inventarios);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener inventarios' });
    }
  }

  async obtenerPorClave(req: Request, res: Response) {
    try {
      const { idPersonaje, numInventario } = this.claves(req);
      const inventario = await this.inventarioService.obtenerPorClave(idPersonaje, numInventario);

      if (!inventario) {
        return res.status(404).json({ message: 'Inventario no encontrado' });
      }

      res.json(inventario);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el inventario' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevo = await this.inventarioService.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el inventario' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { idPersonaje, numInventario } = this.claves(req);
      const actualizado = await this.inventarioService.actualizar(idPersonaje, numInventario, req.body);

      if (!actualizado) {
        return res.status(404).json({ message: 'Inventario no encontrado para actualizar' });
      }

      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el inventario' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { idPersonaje, numInventario } = this.claves(req);
      const eliminado = await this.inventarioService.eliminar(idPersonaje, numInventario);

      if (!eliminado) {
        return res.status(404).json({ message: 'Inventario no encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el inventario' });
    }
  }
}
