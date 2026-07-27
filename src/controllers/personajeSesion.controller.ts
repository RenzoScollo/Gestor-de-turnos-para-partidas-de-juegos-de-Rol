import { type Request, type Response } from 'express';
import { PersonajeSesionService } from '../services/personajeSesion.service';

export class PersonajeSesionController {
  private personajeSesionService: PersonajeSesionService;

  constructor(personajeSesionService: PersonajeSesionService) {
    this.personajeSesionService = personajeSesionService;
  }

  // Clave triple en la URL: /api/personaje-sesion/:idPersonaje/:idPartida/:numSesion
  private claves(req: Request) {
    return {
      idPersonaje: parseInt(String(req.params.idPersonaje), 10),
      idPartida: parseInt(String(req.params.idPartida), 10),
      numSesion: parseInt(String(req.params.numSesion), 10),
    };
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const registros = await this.personajeSesionService.obtenerTodos();
      res.json(registros);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener registros personaje-sesion' });
    }
  }

  async obtenerPorClave(req: Request, res: Response) {
    try {
      const { idPersonaje, idPartida, numSesion } = this.claves(req);
      const registro = await this.personajeSesionService.obtenerPorClave(idPersonaje, idPartida, numSesion);

      if (!registro) {
        return res.status(404).json({ message: 'Registro personaje-sesion no encontrado' });
      }

      res.json(registro);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el registro personaje-sesion' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const nuevo = await this.personajeSesionService.crear(req.body);
      res.status(201).json(nuevo);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el registro personaje-sesion' });
    }
  }

  async actualizar(req: Request, res: Response) {
    try {
      const { idPersonaje, idPartida, numSesion } = this.claves(req);
      const actualizado = await this.personajeSesionService.actualizar(idPersonaje, idPartida, numSesion, req.body);

      if (!actualizado) {
        return res.status(404).json({ message: 'Registro personaje-sesion no encontrado para actualizar' });
      }

      res.json(actualizado);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el registro personaje-sesion' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { idPersonaje, idPartida, numSesion } = this.claves(req);
      const eliminado = await this.personajeSesionService.eliminar(idPersonaje, idPartida, numSesion);

      if (!eliminado) {
        return res.status(404).json({ message: 'Registro personaje-sesion no encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el registro personaje-sesion' });
    }
  }
}
