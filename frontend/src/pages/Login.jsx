import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '60px auto' }}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom d'utilisateur</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ marginTop: 16, width: '100%' }}>Se connecter</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ fontSize: 12, marginTop: 16, color: '#666' }}>
        Comptes de démo : admin/admin123, artec/artec123, yas_user/yas123, orange_user/orange123, airtel_user/airtel123
      </p>
    </div>
  );
}