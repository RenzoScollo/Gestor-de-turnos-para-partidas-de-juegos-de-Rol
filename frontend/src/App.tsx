import * as React from 'react';
import { useEffect, useState } from 'react';
import type { Usuario } from './interfaces.ts';
import { usuarioService, type TipoUsuario } from './services/usuario.service';

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
  const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);

  // Trae la lista desde la API. Se llama al montar y despues de cada registro.
  async function refrescarUsuarios() {
    try {
      setUsuarios(await usuarioService.obtenerTodos());
    } catch (error) {
      setMensaje(
        'No se pudo conectar con el servidor. ¿Está corriendo el backend (npm run dev)?'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    refrescarUsuarios();
  }, []);

  async function registrarUsuario(
    nombreUsuario: string,
    nickname: string,
    contrasena: string,
    tipo: TipoUsuario
  ) {
    const yaExiste = usuarios.some((u: Usuario) => u.nickname === nickname);
    if (yaExiste) {
      setMensaje('Ese nickname ya está en uso.');
      return;
    }

    try {
      await usuarioService.registrar(nombreUsuario, nickname, contrasena, tipo);
      await refrescarUsuarios();
      setMensaje(
        `${tipo === 'jugador' ? 'Jugador' : 'Anfitrión'} registrado con éxito.`
      );
      setVista('principal');
    } catch (error) {
      setMensaje(`No se pudo registrar: ${(error as Error).message}`);
    }
  }

  async function loguearse(nickname: string, contrasena: string) {
    try {
      const encontrado = await usuarioService.login(nickname, contrasena);
      if (encontrado) {
        setUsuarioLogueado(encontrado);
        setMensaje(`Bienvenido ${encontrado.nickname}.`);
      } else {
        setMensaje('Usuario o contraseña incorrectos.');
      }
      setVista('principal');
    } catch (error) {
      setMensaje(`Error al iniciar sesión: ${(error as Error).message}`);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Gestor de turnos — juegos de rol</h2>

      {mensaje && (
        <p style={{ background: '#eee', padding: '0.5rem', borderRadius: 4 }}>{mensaje}</p>
      )}

      {usuarioLogueado && (
        <p>
          Sesión activa: <strong>{usuarioLogueado.nickname}</strong>
        </p>
      )}

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

      <hr />
      <p>Usuarios registrados (guardados en la base de datos):</p>
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <ul>
          {usuarios.map((u: Usuario) => (
            <li key={u.idUsuario}>
              {u.nickname} — {u.nombreUsuario}
            </li>
          ))}
        </ul>
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
    tipo: 'jugador' | 'anfitrion'
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