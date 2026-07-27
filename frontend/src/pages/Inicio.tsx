import { useEffect, useState } from 'react';
import type { Partida, Usuario } from '../interfaces';
import type { UsuarioAutenticado } from '../services/auth.service';
import { api } from '../services/api';
import { usuarioService } from '../services/usuario.service';
import { BarraUsuario } from '../components/BarraUsuario';

interface Props {
  usuario: UsuarioAutenticado;
  onCerrarSesion: () => void;
  onNuevaPartida: () => void;
  onCrearMisiones: () => void;
}

// Pantalla de Inicio del diseno. Las "Sesiones Disponibles" se arman con las
// partidas activas que trae la API (/api/partidas), y "Jugadores en linea" con
// los usuarios registrados.
export function Inicio({ usuario, onCerrarSesion, onNuevaPartida, onCrearMisiones }: Props) {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  const esAnfitrion = usuario.roles.includes('anfitrion');

  useEffect(() => {
    (async () => {
      try {
        const [listaPartidas, listaUsuarios] = await Promise.all([
          api.partidas.obtenerTodos(),
          usuarioService.obtenerTodos(),
        ]);
        setPartidas(listaPartidas);
        setUsuarios(listaUsuarios);
      } catch (error) {
        setMensaje((error as Error).message);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const partidasActivas = partidas.filter((p) => p.estado);

  // Iniciales para el avatar del chip: "Franco Testi" -> "FT"
  function iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? '')
      .join('');
  }

  return (
    <div className="pagina">
      <BarraUsuario usuario={usuario} onCerrarSesion={onCerrarSesion} />

      {mensaje && <p className="aviso">{mensaje}</p>}

      <div className="grilla-principal">
        {/* Unirse a una partida */}
        <div className="columna">
          <button className="btn btn--grande" onClick={onNuevaPartida}>
            {esAnfitrion ? 'Crear una Partida' : 'Unirse a una Partida'}
          </button>
          <div className="marco-imagen">Imagen de una mazmorra</div>
        </div>

        {/* Partidas activas */}
        <div className="columna">
          <div className="encabezado-verde">Partidas Activas</div>
          <div className="marco-imagen marco-imagen--verde">
            {cargando
              ? 'Cargando…'
              : `${partidasActivas.length} partida${partidasActivas.length === 1 ? '' : 's'} en curso`}
          </div>
          {esAnfitrion && (
            <button className="btn" onClick={onCrearMisiones}>
              Crear Misiones
            </button>
          )}
        </div>

        {/* Sesiones disponibles */}
        <div className="columna">
          <label className="etiqueta" style={{ textAlign: 'right' }}>
            Sesiones Disponibles
          </label>
          <div className="lista">
            {cargando && <div className="lista__vacia">Cargando…</div>}

            {!cargando && partidasActivas.length === 0 && (
              <div className="lista__vacia">No hay partidas activas todavía</div>
            )}

            {partidasActivas.map((partida) => (
              <div key={partida.idPartida} className="lista__item">
                <span>
                  #{partida.idPartida} · {partida.nombre}
                  {partida.contrasena ? ' 🔒' : ''}
                </span>
                <button className="btn btn--oro btn--chico">Unirse</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jugadores en linea */}
      <div className="seccion">
        <label className="etiqueta">Jugadores en línea</label>
        <div className="chips">
          {cargando && <span className="lista__vacia">Cargando…</span>}

          {usuarios.map((u) => (
            <div key={u.idUsuario} className="chip">
              <span className="chip__iniciales">{iniciales(u.nombreUsuario || u.nickname)}</span>
              <span>{u.nickname}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pie">Gestor de Turnos — Juegos de Rol</div>
    </div>
  );
}
