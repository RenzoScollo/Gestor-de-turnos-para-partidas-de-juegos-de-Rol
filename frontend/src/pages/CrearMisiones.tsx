import { useEffect, useState } from 'react';
import type { Mision, Sesion } from '../interfaces';
import type { UsuarioAutenticado } from '../services/auth.service';
import { api } from '../services/api';
import { BarraUsuario } from '../components/BarraUsuario';

interface Props {
  usuario: UsuarioAutenticado;
  onVolver: () => void;
}

type TipoRecompensa = 'bounty' | 'xp';

// Pantalla "Crear Misiones" (panel del anfitrion).
//
// NOTA sobre el diseno: la maqueta pedia campos que NO existen en la entidad
// Mision del modelo (nombre de la mision, y "Porcentaje"). Aca se usan los
// campos reales del esquema:
//   Bounty            -> dineroTotal / dineroOtorgadoAJugadores
//   XP                -> xpTotal / xpOtorgadoJugadores
//   Votantes minimos  -> asistenciaGrupoGrande
// Una mision pertenece a una Sesion, asi que primero hay que elegirla.
export function CrearMisiones({ usuario, onVolver }: Props) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [sesionElegida, setSesionElegida] = useState('');

  const [descripcion, setDescripcion] = useState('');
  const [tipoRecompensa, setTipoRecompensa] = useState<TipoRecompensa>('bounty');
  const [dineroTotal, setDineroTotal] = useState('');
  const [xpTotal, setXpTotal] = useState('');
  const [asistencia, setAsistencia] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [detalle, setDetalle] = useState<Mision | null>(null);

  async function refrescar() {
    try {
      const [listaSesiones, listaMisiones] = await Promise.all([
        api.sesiones.obtenerTodos(),
        api.misiones.obtenerTodos(),
      ]);
      setSesiones(listaSesiones);
      setMisiones(listaMisiones);
    } catch (error) {
      setMensaje((error as Error).message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    refrescar();
  }, []);

  function claveDe(s: Sesion): string {
    // La sesion viene con la partida poblada desde el backend
    const idPartida = (s as unknown as { partida: { idPartida: number } }).partida?.idPartida;
    return `${idPartida}-${s.numSesion}`;
  }

  async function agregarMision() {
    if (!sesionElegida) {
      setMensaje('Elegí a qué sesión pertenece la misión.');
      return;
    }
    if (!descripcion.trim()) {
      setMensaje('La misión necesita una descripción.');
      return;
    }

    const [idPartida, numSesion] = sesionElegida.split('-').map(Number);

    // numMision lo asigna la app: siguiente numero dentro de esa sesion
    const deEsaSesion = misiones.filter(
      (m) => m.idPartida === idPartida && m.numSesion === numSesion
    );
    const numMision = deEsaSesion.length + 1;

    const dinero = parseInt(dineroTotal, 10) || 0;
    const xp = parseInt(xpTotal, 10) || 0;

    setGuardando(true);
    try {
      await api.misiones.crear({
        sesion: { partida: idPartida, numSesion },
        numMision,
        descripcion: descripcion.trim(),
        dineroTotal: dinero,
        xpTotal: xp,
        // Lo que reciben los jugadores (por ahora, el total)
        dineroOtorgadoAJugadores: tipoRecompensa === 'bounty' ? dinero : 0,
        xpOtorgadoJugadores: tipoRecompensa === 'xp' ? xp : 0,
        asistenciaGrupoGrande: parseInt(asistencia, 10) || 0,
        estado: false,
      });

      setMensaje('Misión agregada.');
      setDescripcion('');
      setDineroTotal('');
      setXpTotal('');
      setAsistencia('');
      await refrescar();
    } catch (error) {
      setMensaje((error as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarMision(m: Mision) {
    try {
      await api.misiones.eliminar(m.idPartida, m.numSesion, m.numMision);
      setDetalle(null);
      await refrescar();
    } catch (error) {
      setMensaje((error as Error).message);
    }
  }

  const pendientes = misiones.filter((m) => !m.estado);

  return (
    <div className="pagina">
      <div className="titulo-fila">
        <h1 className="titulo">Crear Misiones</h1>
        <span className="subtitulo">Panel del Anfitrión</span>
      </div>

      <BarraUsuario usuario={usuario} />

      {mensaje && <p className="aviso">{mensaje}</p>}

      <div className="grilla-principal grilla-principal--misiones">
        {/* Columna 1: sesion y descripcion */}
        <div className="columna">
          <div>
            <label className="etiqueta" htmlFor="sesion">Sesión</label>
            <select
              id="sesion"
              className="campo"
              value={sesionElegida}
              onChange={(e) => setSesionElegida(e.target.value)}
            >
              <option value="">
                {cargando ? 'Cargando…' : sesiones.length ? 'Elegí una sesión' : 'No hay sesiones'}
              </option>
              {sesiones.map((s) => (
                <option key={claveDe(s)} value={claveDe(s)}>
                  Partida #{claveDe(s).split('-')[0]} · Sesión {s.numSesion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="etiqueta" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              className="campo"
              rows={9}
              placeholder="Ej: Cazar al lobo alfa que acecha el camino del norte"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        {/* Columna 2: recompensas y restricciones */}
        <div className="columna">
          <div className="grilla-dos">
            <div>
              <label className="etiqueta">Recompensas</label>
              <div className="columna">
                <button
                  className="btn btn--toggle"
                  aria-pressed={tipoRecompensa === 'bounty'}
                  onClick={() => setTipoRecompensa('bounty')}
                >
                  Bounty
                </button>
                <input
                  className="campo"
                  type="number"
                  min={0}
                  placeholder="Monto en monedas"
                  value={dineroTotal}
                  onChange={(e) => setDineroTotal(e.target.value)}
                />
                <button
                  className="btn btn--toggle btn--toggle-xp"
                  aria-pressed={tipoRecompensa === 'xp'}
                  onClick={() => setTipoRecompensa('xp')}
                >
                  XP
                </button>
                <input
                  className="campo"
                  type="number"
                  min={0}
                  placeholder="Monto de XP"
                  value={xpTotal}
                  onChange={(e) => setXpTotal(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="etiqueta">Restricciones</label>
              <div className="columna">
                <div className="encabezado-rojo">Votantes Mínimos</div>
                <input
                  className="campo"
                  type="number"
                  min={0}
                  placeholder="Cantidad"
                  value={asistencia}
                  onChange={(e) => setAsistencia(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button className="btn btn--verde" onClick={agregarMision} disabled={guardando}>
            {guardando ? 'Agregando…' : 'Agregar Misión'}
          </button>
        </div>

        {/* Columna 3: misiones creadas */}
        <div>
          <label className="etiqueta" style={{ textAlign: 'right' }}>
            Misiones Creadas y No Activas
          </label>
          <div className="lista">
            {cargando && <div className="lista__vacia">Cargando…</div>}

            {!cargando && pendientes.length === 0 && (
              <div className="lista__vacia">Sin misiones creadas todavía</div>
            )}

            {pendientes.map((m) => (
              <div
                key={`${m.idPartida}-${m.numSesion}-${m.numMision}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <button
                  className="btn"
                  style={{ flex: 1, textAlign: 'left', fontSize: 13 }}
                  onClick={() => setDetalle(m)}
                >
                  {m.descripcion.slice(0, 40)}
                  {m.descripcion.length > 40 ? '…' : ''}
                </button>
                <button
                  className="btn btn--rojo btn--chico"
                  aria-label="Eliminar"
                  onClick={() => eliminarMision(m)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn--oro btn--ancho" onClick={onVolver}>
        Volver al Inicio
      </button>

      {/* Modal de detalle */}
      {detalle && (
        <div className="modal-fondo" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="subtitulo">Detalle de misión</div>
            <h2 className="modal__titulo">
              Misión {detalle.numMision} · Partida #{detalle.idPartida}
            </h2>
            <div className="columna">
              <div className="modal__dato">
                <span>Descripción</span>
                <span>{detalle.descripcion}</span>
              </div>
              <div className="modal__dato">
                <span>Dinero</span>
                <span>{detalle.dineroTotal}</span>
              </div>
              <div className="modal__dato">
                <span>XP</span>
                <span>{detalle.xpTotal}</span>
              </div>
              <div className="modal__dato">
                <span>Votantes mínimos</span>
                <span>{detalle.asistenciaGrupoGrande}</span>
              </div>
            </div>
            <div className="modal__acciones">
              <button className="btn btn--fantasma" onClick={() => setDetalle(null)}>
                Cerrar
              </button>
              <button className="btn btn--rojo" onClick={() => eliminarMision(detalle)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
