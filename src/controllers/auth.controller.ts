import { type Request, type Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async registrar(req: Request, res: Response) {
    try {
      const resultado = await this.authService.registrar(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { nickname, contrasena } = req.body;
      const resultado = await this.authService.login(nickname, contrasena);
      res.json(resultado);
    } catch (error) {
      // 401: credenciales invalidas
      res.status(401).json({ message: (error as Error).message });
    }
  }

  // Devuelve los datos del usuario del token (ruta protegida)
  async perfil(req: Request, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ message: 'No autenticado' });
      }

      const perfil = await this.authService.obtenerPerfil(req.usuario.idUsuario);
      if (!perfil) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(perfil);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el perfil' });
    }
  }
}
