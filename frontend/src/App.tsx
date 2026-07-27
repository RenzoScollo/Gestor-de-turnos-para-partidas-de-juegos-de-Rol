import * as React from 'react';
import { useEffect, useState } from 'react';
import type { Usuario } from './interfaces.ts';
import { usuarioService } from './services/usuario.service';
import { authService, type Rol, type UsuarioAutenticado } from './services/auth.service';

// allow JSX in environments without @types/react
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Vista actual del "menú" (reemplaza el while + switch de la consola)
type Vista = 'principal' | 'registro' | 'login';

export default function MenuApp() {
  // Los usuarios ya NO viven en memoria: se traen del backend (MySQL).
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vista, setVista] = useState<Vista>('principal');
  const [usuarioLogueado, setUsuarioLogueado] = useState<UsuarioAutenticado | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);

  // La lista de usuarios es una ruta protegida: solo se puede traer con sesion.
  async function refrescarUsuarios() {
    try {
      setUsuarios(await usuarioService.obtenerTodos());
    } catch (error) {
      setUsuarios([]);
    }
  }

  // Al cargar la pagina intentamos recuperar la sesion con el token guardado
  useEffect(() => {
    (async () => {
      try {
        const perfil = await authService.perfil();
        if (perfil) {
          setUsuarioLogueado(perfil);
          await refrescarUsuarios();
        }
      } catch {
        setMensaje('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  async function registrarUsuario(
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    rol: Rol
  ) {
    try {
      // El registro devuelve el token: queda logueado automaticamente
      const usuario = await authService.registrar(nombreUsuario, nickname, contrasena, rol);
      setUsuarioLogueado(usuario);
      await refrescarUsuarios();
      setMensaje(`Bienvenido ${usuario.nickname}, te registraste como ${rol}.`);
      setVista('principal');
    } catch (error) {
      setMensaje(`No se pudo registrar: ${(error as Error).message}`);
    }
  }

  async function loguearse(nickname: string, contrasena: string) {
    try {
      const usuario = await authService.login(nickname, contrasena);
      setUsuarioLogueado(usuario);
      await refrescarUsuarios();
      setMensaje(`Bienvenido ${usuario.nickname} (${usuario.roles.join(', ')}).`);
      setVista('principal');
    } catch (error) {
      setMensaje((error as Error).message);
    }
  }

  function cerrarSesion() {
    authService.cerrarSesion();
    setUsuarioLogueado(null);
    setUsuarios([]);
    setMensaje('Sesión cerrada.');
    setVista('principal');
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Gestor de turnos — juegos de rol</h2>

      {mensaje && (
        <p style={{ background: '#eee', padding: '0.5rem', borderRadius: 4 }}>{mensaje}</p>
      )}

      {cargando && <p>Cargando…</p>}

      {/* CON sesion: datos del usuario y la lista (ruta protegida) */}
      {!cargando && usuarioLogueado && (
        <>
          <p>
            Sesión activa: <strong>{usuarioLogueado.nickname}</strong>{' '}
            <em>({usuarioLogueado.roles.join(', ')})</em>{' '}
            <button onClick={cerrarSesion}>Cerrar sesión</button>
          </p>

          <hr />
          <p>Usuarios registrados (guardados en la base de datos):</p>
          <ul>
            {usuarios.map((u: Usuario) => (
              <li key={u.idUsuario}>
                {u.nickname} — {u.nombreUsuario}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* SIN sesion: solo login y registro */}
      {!cargando && !usuarioLogueado && (
        <>
          {vista === 'principal' && (
            <PantallaPrincipal
              onLoguearse={() => setVista('login')}
              onRegistrarse={() => setVista('registro')}
            />
          )}

          {vista === 'registro' && (
            <PantallaRegistro
              onRegistrar={registrarUsuario}
              onVolver={() => setVista('principal')}
            />
          )}

          {vista === 'login' && (
            <PantallaLogin onLoguearse={loguearse} onVolver={() => setVista('principal')} />
          )}
        </>
      )}
    </div>
  );
}
 
function PantallaPrincipal({
  onLoguearse,
  onRegistrarse,
}: {
  onLoguearse: () => void;
  onRegistrarse: () => void;
}) {
  return (
    <div>
      <button onClick={onLoguearse}>Loguearse</button>
      <button onClick={onRegistrarse}>Registrarse</button>
    </div>
  );
}
 
function PantallaLogin({
  onLoguearse,
  onVolver,
}: {
  onLoguearse: (nickname: string, contrasena: string) => void | Promise<void>;
  onVolver: () => void;
}) {
  const [nickname, setNickname] = useState('');
  const [contrasena, setContrasena] = useState('');
 
  return (
    <div>
      <input
        placeholder="Nickname"
        value={nickname}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={contrasena}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
      />
      <button onClick={() => onLoguearse(nickname, contrasena)}>Ingresar</button>
      <button onClick={onVolver}>Volver</button>
    </div>
  );
}
 
function PantallaRegistro({
  onRegistrar,
  onVolver,
}: {
  onRegistrar: (
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    rol: 'jugador' | 'anfitrion'
  ) => void | Promise<void>;
  onVolver: () => void;
}) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nickname, setNickname] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [tipo, setTipo] = useState<'jugador' | 'anfitrion'>('jugador');
 
  return (
    <div>
      <input
        placeholder="Nombre y apellido"
        value={nombreUsuario}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreUsuario(e.target.value)}
      />
      <input
        placeholder="Nickname"
        value={nickname}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={contrasena}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
      />
      <label>
        <input
          type="radio"
          checked={tipo === 'jugador'}
          onChange={() => setTipo('jugador')}
        />
        Jugador
      </label>
      <label>
        <input
          type="radio"
          checked={tipo === 'anfitrion'}
          onChange={() => setTipo('anfitrion')}
        />
        Anfitrión
      </label>
      <button onClick={() => onRegistrar(nombreUsuario, nickname, contrasena, tipo)}>
        Registrar
      </button>
      <button onClick={onVolver}>Volver</button>
    </div>
  );
}