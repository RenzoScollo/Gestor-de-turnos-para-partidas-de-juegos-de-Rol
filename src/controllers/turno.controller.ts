import { type Request, type Response } from 'express';
import { TurnoService } from '../services/turno.service';

export class TurnoController {
  private turnoService: TurnoService;

  constructor(turnoService: TurnoService) {
    this.turnoService = turnoService;
  }

  private claves(req: Request) {
    return {
      idPartida: parseInt(String(req.params.idPartida), 10),
      numSesion: parseInt(String(req.params.numSesion), 10),
    };
  }

  // Solo el anfitrion dueño de la partida puede manejar el turno de sus sesiones.
  private async verificarDueno(req: Request, res: Response, idPartida: number): Promise<boolean> {
    const idUsuario = req.usuario?.idUsuario;
    if (!idUsuario) {
      res.status(401).json({ message: 'No autenticado' });
      return false;
    }

    const esDueno = await this.turnoService.esAnfitrionDePartida(idPartida, idUsuario);
    if (!esDueno) {
      res
        .status(403)
        .json({ message: 'Solo el anfitrion dueño de esta partida puede manejar el turno' });
      return false;
    }

    return true;
  }

  async obtener(req: Request, res: Response) {
    try {
      const { idPartida, numSesion } = this.claves(req);
      const sesion = await this.turnoService.obtenerTurnoActual(idPartida, numSesion);

      if (!sesion) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      res.json({ turnoActual: sesion.turnoActual ?? null });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el turno' });
    }
  }

  async iniciar(req: Request, res: Response) {
    try {
      const { idPartida, numSesion } = this.claves(req);
      if (!(await this.verificarDueno(req, res, idPartida))) return;

      const sesion = await this.turnoService.iniciarTurno(idPartida, numSesion);
      if (!sesion) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      res.json({ turnoActual: sesion.turnoActual });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async avanzar(req: Request, res: Response) {
    try {
      const { idPartida, numSesion } = this.claves(req);
      if (!(await this.verificarDueno(req, res, idPartida))) return;

      const sesion = await this.turnoService.avanzarTurno(idPartida, numSesion);
      if (!sesion) {
        return res.status(404).json({ message: 'Sesion no encontrada' });
      }

      res.json({ turnoActual: sesion.turnoActual });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
}
