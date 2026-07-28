// Test unitario: logica de hasheo y de tokens de AuthService.
// No toca la base de datos (no se instancia AuthService con un EntityManager
// real): solo se prueban los metodos estaticos, que son logica pura.
import { AuthService } from './auth.service';

describe('AuthService — contraseñas', () => {
  it('hashea la contraseña y comparar() reconoce la contraseña correcta', async () => {
    const hash = await AuthService.hashear('miClave123');

    expect(hash).not.toBe('miClave123'); // nunca se guarda en texto plano
    expect(await AuthService.comparar('miClave123', hash)).toBe(true);
  });

  it('comparar() rechaza una contraseña incorrecta', async () => {
    const hash = await AuthService.hashear('miClave123');

    expect(await AuthService.comparar('otraClave', hash)).toBe(false);
  });
});

describe('AuthService — tokens JWT', () => {
  it('genera un token y verificarToken() devuelve el mismo payload', () => {
    const token = AuthService.generarToken({ idUsuario: 42, roles: ['jugador'] });

    const payload = AuthService.verificarToken(token);

    expect(payload.idUsuario).toBe(42);
    expect(payload.roles).toEqual(['jugador']);
  });

  it('verificarToken() rechaza un token invalido o adulterado', () => {
    const token = AuthService.generarToken({ idUsuario: 1, roles: ['anfitrion'] });
    const adulterado = token.slice(0, -3) + 'xxx';

    expect(() => AuthService.verificarToken(adulterado)).toThrow('Token invalido o expirado');
  });
});
