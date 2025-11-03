import React, { useState } from 'react';
import { api } from './api.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      onLogin(result.user);
    } catch (err) {
      setError('Usuário ou senha inválidos.');
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
      <div className="login-box" style={{ width: 380, padding: 40, background: 'var(--bg-medium)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <img src="https://i.imgur.com/2JKI95m.png" alt="Centel Logo" className="logo" style={{ width: 180, marginBottom: 30 }} onError={(e) => { 
          if (e.target.src.includes('.png')) {
            e.target.src = 'https://i.imgur.com/2JKI95m.jpg';
          } else {
            e.target.src = 'https://imgur.com/a/ZaT2ZTS#2JKI95m';
          }
        }} />
        <form onSubmit={submit}>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: 20 }}>
            <label>Usuário</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 12, background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: 5, color: 'var(--text-primary)', fontSize: 16 }} />
          </div>
          <div className="input-group" style={{ textAlign: 'left', marginBottom: 20 }}>
            <label>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 12, background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: 5, color: 'var(--text-primary)', fontSize: 16 }} />
          </div>
          {error && <p style={{ color: 'var(--danger)', marginTop: 15, fontSize: 14 }}>{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
