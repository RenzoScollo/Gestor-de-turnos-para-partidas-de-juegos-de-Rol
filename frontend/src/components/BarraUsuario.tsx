import type { UsuarioAutenticado } from '../services/auth.service';

interface Props {
  usuario: UsuarioAutenticado;
  onCerrarSesion?: () => void;
}

// Barra superior con el usuario logueado, comun a todas las pantallas.
export function BarraUsuario({ usuario, onCerrarSesion }: Props) {
  return (
    <div className="barra-usuario">
      <div className="barra-usuario__izq">
        <span className="punto-online" />
        <span className="nombre-usuario">{usuario.nickname}</span>
        {usuario.roles.map((rol) => (
          <span key={rol} className="etiqueta-rol">
            {rol === 'anfitrion' ? 'Anfitrión' : 'Jugador'}
          </span>
        ))}
      </div>

      <div className="barra-usuario__der">
        {onCerrarSesion && (
          <button className="btn btn--fantasma btn--chico" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        )}
        <div className="avatar">
          FOTO
          <br />
          PERFIL
        </div>
      </div>
    </div>
  );
}
