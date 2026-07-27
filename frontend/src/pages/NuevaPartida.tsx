import { useState } from 'react';
import type { UsuarioAutenticado } from '../services/auth.service';
import { api } from '../services/api';
import { BarraUsuario } from '../components/BarraUsuario';

interface Props {
  usuario: UsuarioAutenticado;
  onVolver: () => void;
  onCreada?: () => void;
}

// Pantalla "Nueva Partida" del diseno. Los campos coinciden con la entidad
// Partida: nombre, contrasena y limiteJugadores.
export function NuevaPartida({ usuario, onVolver, onCreada }: Props) {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [limiteJugadores, setLimiteJugadores] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const esAnfitrion = usuario.roles.includes('anfitrion');

  async function crearPartida() {
    if (!nombre.trim()) {
      setMensaje('La partida necesita un nombre.');
      return;
    }

    const limite = parseInt(limiteJugadores, 10);
    if (!Number.isFinite(limite) || limite < 1) {
      setMensaje('El máximo de jugadores debe ser un número mayor a 0.');
      return;
    }

    setGuardando(true);
    try {
      await api.partidas.crear({
        nombre: nombre.trim(),
        // Vacia = partida publica
        contrasena,
        limiteJugadores: limite,
        estado: true,
        // La organiza el anfitrion logueado
        anfitrion: usuario.idUsuario,
      } as never);

      setMensaje(`Partida "${nombre}" creada.`);
      setNombre('');
      setContrasena('');
      setLimiteJugadores('');
      onCreada?.();
    } catch (error) {
      setMensaje((error as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="pagina pagina--angosta">
      <BarraUsuario usuario={usuario} />

      <div className="titulo-fila">
        <h1 className="titulo">Nueva Partida</h1>
      </div>

      {!esAnfitrion && (
        <p className="aviso">
          Solo los anfitriones pueden crear partidas. Tu cuenta es de jugador.
        </p>
      )}

      {mensaje && <p className="aviso">{mensaje}</p>}

      <div className="columna">
        <div className="grilla-dos">
          <label className="campo-etiqueta" htmlFor="nombre">Nombre:</label>
          <input
            id="nombre"
            className="campo campo--grande"
            placeholder="Nombre de la partida"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grilla-dos">
          <label className="campo-etiqueta" htmlFor="contrasena">Contraseña:</label>
          <input
            id="contrasena"
            className="campo campo--grande"
            type="password"
            placeholder="Vacía = partida pública"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>

        <div className="grilla-dos">
          <label className="campo-etiqueta" htmlFor="limite">Máximo de jugadores:</label>
          <input
            id="limite"
            className="campo campo--grande"
            type="number"
            min={1}
            placeholder="Ej: 4"
            value={limiteJugadores}
            onChange={(e) => setLimiteJugadores(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn--verde"
        style={{ alignSelf: 'center', padding: '16px 60px' }}
        onClick={crearPartida}
        disabled={guardando || !esAnfitrion}
      >
        {guardando ? 'Creando…' : 'Crear Partida'}
      </button>

      <button className="btn btn--fantasma" style={{ alignSelf: 'center' }} onClick={onVolver}>
        Volver
      </button>
    </div>
  );
}
