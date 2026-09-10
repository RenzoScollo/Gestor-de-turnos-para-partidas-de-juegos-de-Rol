import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Alert } from '../components/ui';

export default function LoginPage() {
  const [nickname, setNickname] = React.useState('');
  const [contrasena, setContrasena] = React.useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const { usuarioLogueado, loguearse } = useUser();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Si ya está logueado, redirige a dashboard
  useEffect(() => {
    if (usuarioLogueado) {
      navigate('/dashboard');
    }
  }, [usuarioLogueado, navigate]);

  const handleLogin = async () => {
    if (!nickname || !contrasena) {
      setErrorLogin('Completa todos los campos');
      return;
    }
    
    setBusy(true); setErrorLogin('');
    try { await loguearse(nickname, contrasena); navigate('/dashboard'); }
    catch (e) { setErrorLogin(e instanceof Error ? e.message : 'No se pudo iniciar sesión'); }
    finally { setBusy(false); }
  };

  return (
    <main style={{ maxWidth: 420, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Iniciar Sesión</h2>

      {errorLogin && (
        <Alert
          type="error"
          message={errorLogin}
          onClose={() => setErrorLogin('')}
        />
      )}

      <form onSubmit={e => { e.preventDefault(); void handleLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label htmlFor="login-nickname">Nickname</label>
        <input
          id="login-nickname"
          autoComplete="username"
          placeholder="Nickname"
          value={nickname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          autoComplete="current-password"
          placeholder="Contraseña"
          type="password"
          value={contrasena}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={busy} style={{ padding: '0.5rem', fontSize: '1rem', color: '#111', background: '#eee' }}>
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => navigate('/register')}
          style={{ padding: '0.5rem', fontSize: '1rem', background: '#2f2f2f', color: 'white' }}
        >
          Ir a Registro
        </button>
      </form>
    </main>
  );
}
