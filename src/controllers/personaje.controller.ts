import { type Request, type Response } from 'express';
import { PersonajeService } from '../services/personaje.service';

export class PersonajeController {
  private personajeService: PersonajeService;

  constructor(personajeService: PersonajeService) {
    this.personajeService = personajeService;
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const personajes = await this.personajeService.obtenerTodos();
      res.json(personajes);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener personajes' });
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const personaje = await this.personajeService.obtenerPorId(id);

      if (!personaje) {
        return res.status(404).json({ message: 'Personaje no encontrado' });
      }

      res.json(personaje);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el personaje' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevo = await this.personajeService.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el personaje' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const actualizado = await this.personajeService.actualizar(id, req.body);

      if (!actualizado) {
        return res.status(404).json({ message: 'Personaje no encontrado para actualizar' });
      }

      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el personaje' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const eliminado = await this.personajeService.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ message: 'Personaje no encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el personaje' });
    }
  }
}
