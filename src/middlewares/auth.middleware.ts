import { type Request, type Response, type NextFunction } from 'express';
import { AuthService, type Rol } from '../services/auth.service';

// Agregamos "usuario" a la Request de Express para que los controllers
// sepan quien esta haciendo el pedido.
declare global {
  namespace Express {
    interface Request {
      usuario?: { idUsuario: number; roles: Rol[] };
    }
  }
}

// Exige un token valido: si no lo hay, corta con 401.
export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const cabecera = req.headers.authorization;

  if (!cabecera) {
    res.status(401).json({ message: 'Falta el token de acceso' });
    return;
  }

  const partes = cabecera.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    res.status(401).json({ message: 'Formato invalido. Use: Bearer <token>' });
    return;
  }

  try {
    const payload = AuthService.verificarToken(String(partes[1]));
    req.usuario = { idUsuario: payload.idUsuario, roles: payload.roles };
    next();
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}

// Exige que el usuario tenga AL MENOS UNO de los roles pedidos.
// Se usa despues de autenticar: router.post('/', autenticar, exigirRol('anfitrion'), ...)
export function exigirRol(...rolesPermitidos: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const tienePermiso = req.usuario.roles.some((rol) => rolesPermitidos.includes(rol));
    if (!tienePermiso) {
      res.status(403).json({
        message: `Acceso denegado: se requiere rol ${rolesPermitidos.join(' o ')}`,
      });
      return;
    }

    next();
  };
}
