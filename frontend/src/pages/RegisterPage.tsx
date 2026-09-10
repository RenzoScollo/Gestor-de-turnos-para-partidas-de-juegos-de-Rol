import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function RegisterPage() {
  const [nombreUsuario, setNombreUsuario] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [contrasena, setContrasena] = React.useState('');
  const [tipo, setTipo] = React.useState<'jugador' | 'anfitrion'>('jugador');
  const { registrarUsuario, mensaje } = useUser();
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const handleRegister = async () => {
    setBusy(true); setError('');
    try { await registrarUsuario(nombreUsuario, nickname, contrasena, tipo); navigate('/login'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo registrar'); }
    finally { setBusy(false); }
  };

  return (
    <main style={{ maxWidth: 420, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Registrarse</h2>
      {error && <p role="alert">{error}</p>}

      {mensaje && (
        <p style={{ background: 'var(--surface-muted)', color: 'var(--text-h)', padding: '0.5rem', borderRadius: 4 }}>
          {mensaje}
        </p>
      )}

      <form onSubmit={e => { e.preventDefault(); void handleRegister(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label htmlFor="register-name">Nombre y apellido</label>
        <input
          id="register-name"
          autoComplete="name"
          placeholder="Nombre y apellido"
          value={nombreUsuario}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreUsuario(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <label htmlFor="register-nickname">Nickname</label>
        <input
          id="register-nickname"
          autoComplete="username"
          placeholder="Nickname"
          value={nickname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          autoComplete="new-password"
          placeholder="Contraseña"
          type="password"
          value={contrasena}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />

        <fieldset style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <legend>Tipo de cuenta</legend>
          <label style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="tipo-cuenta"
              checked={tipo === 'jugador'}
              onChange={() => setTipo('jugador')}
            />
            Jugador
          </label>
          <label style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="radio"
              name="tipo-cuenta"
              checked={tipo === 'anfitrion'}
              onChange={() => setTipo('anfitrion')}
            />
            Anfitrión
          </label>
        </fieldset>

        <button type="submit" disabled={busy} style={{ padding: '0.5rem', fontSize: '1rem' }}>
          Registrar
        </button>
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{ padding: '0.5rem', fontSize: '1rem', background: '#222222', color: 'white' }}
        >
          Ir a Login
        </button>
      </form>
    </main>
  );
}
