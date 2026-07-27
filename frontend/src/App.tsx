import { useEffect, useState } from 'react';
import './styles/theme.css';
import { authService, type Rol, type UsuarioAutenticado } from './services/auth.service';
import { Inicio } from './pages/Inicio';
import { NuevaPartida } from './pages/NuevaPartida';
import { CrearMisiones } from './pages/CrearMisiones';

type Vista = 'inicio' | 'nuevaPartida' | 'crearMisiones';

export default function App() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [vista, setVista] = useState<Vista>('inicio');
  const [cargando, setCargando] = useState(true);

  // Recupera la sesion al recargar la pagina (token guardado)
  useEffect(() => {
    (async () => {
      try {
        setUsuario(await authService.perfil());
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  function cerrarSesion() {
    authService.cerrarSesion();
    setUsuario(null);
    setVista('inicio');
  }

  if (cargando) {
    return (
      <div className="pagina pagina--angosta">
        <p className="aviso">Cargando…</p>
      </div>
    );
  }

  if (!usuario) {
    return <Acceso onEntrar={setUsuario} />;
  }

  if (vista === 'nuevaPartida') {
    return <NuevaPartida usuario={usuario} onVolver={() => setVista('inicio')} />;
  }

  if (vista === 'crearMisiones') {
    return <CrearMisiones usuario={usuario} onVolver={() => setVista('inicio')} />;
  }

  return (
    <Inicio
      usuario={usuario}
      onCerrarSesion={cerrarSesion}
      onNuevaPartida={() => setVista('nuevaPartida')}
      onCrearMisiones={() => setVista('crearMisiones')}
    />
  );
}

// ---------- Login / Registro ----------

function Acceso({ onEntrar }: { onEntrar: (u: UsuarioAutenticado) => void }) {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [nickname, setNickname] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<Rol>('jugador');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    setMensaje('');
    try {
      const usuario =
        modo === 'login'
          ? await authService.login(nickname, contrasena)
          : await authService.registrar(nombreUsuario, nickname, contrasena, rol);
      onEntrar(usuario);
    } catch (error) {
      setMensaje((error as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina pagina--angosta">
      <div className="titulo-fila">
        <h1 className="titulo">Gestor de Turnos</h1>
        <span className="subtitulo">Juegos de Rol</span>
      </div>

      {mensaje && <p className="aviso">{mensaje}</p>}

      <div className="columna">
        {modo === 'registro' && (
          <div>
            <label className="etiqueta" htmlFor="nombreUsuario">Nombre y apellido</label>
            <input
              id="nombreUsuario"
              className="campo"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="etiqueta" htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            className="campo"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div>
          <label className="etiqueta" htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            className="campo"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
          />
        </div>

        {modo === 'registro' && (
          <div>
            <label className="etiqueta">Tipo de cuenta</label>
            <div className="grilla-dos">
              <button
                className="btn btn--toggle"
                aria-pressed={rol === 'jugador'}
                onClick={() => setRol('jugador')}
              >
                Jugador
              </button>
              <button
                className="btn btn--toggle btn--toggle-xp"
                aria-pressed={rol === 'anfitrion'}
                onClick={() => setRol('anfitrion')}
              >
                Anfitrión
              </button>
            </div>
          </div>
        )}

        <button className="btn btn--oro" onClick={enviar} disabled={enviando}>
          {enviando ? 'Enviando…' : modo === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>

        <button
          className="btn btn--fantasma"
          onClick={() => {
            setModo(modo === 'login' ? 'registro' : 'login');
            setMensaje('');
          }}
        >
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : 'Ya tengo cuenta'}
        </button>
      </div>

      <div className="pie">Gestor de Turnos — Juegos de Rol</div>
    </div>
  );
}
