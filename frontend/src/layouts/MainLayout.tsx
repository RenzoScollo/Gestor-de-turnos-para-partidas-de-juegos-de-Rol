import { Outlet, useNavigate, Navigate, NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';
import './MainLayout.css';

export default function MainLayout() {
  const { usuarioLogueado, logout, mensaje, limpiarMensaje, cargandoSesion } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch { window.alert('No se pudo cerrar la sesión. Reintentá.'); }
  };

  // Solo mostrar layout si está logueado
  if (cargandoSesion) return <p role="status">Recuperando sesión…</p>;
  if (!usuarioLogueado) return <Navigate to="/login" replace />;

  return (
    <div className="main-layout">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      {/* Alert global */}
      {mensaje && (
        <div className="global-alert">
          <Alert
            type="success"
            message={mensaje}
            onClose={() => {
              limpiarMensaje();
            }}
          />
        </div>
      )}

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <p>Gestor de Turnos - Juegos de Rol</p>
        </div>
        <div className="navbar-user">
          <span>Hola, {usuarioLogueado.nickname}</span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div className="layout-container">
        <aside className="sidebar">
          <nav aria-label="Navegación principal">
          <ul className="nav-menu">
            {[
              ['/dashboard', 'Dashboard'], ['/users', 'Usuarios'], ['/games', 'Partidas'],
              ['/characters', 'Personajes'], ['/classes', 'Clases'], ['/stores', 'Tiendas'],
              ['/objects', 'Objetos'], ['/sessions', 'Sesiones'], ['/missions', 'Misiones'],
              ['/inventory', 'Inventarios'], ['/profiles', 'Perfiles'],
            ].map(([path, label]) => <li key={path}><NavLink to={path}>{label}</NavLink></li>)}
          </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main id="contenido" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
