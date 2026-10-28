import { useEffect, useState } from 'react';
import api from '../api/axios';

const ROLES = ['yas', 'orange', 'airtel', 'artec', 'admin'];

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'artec' });
  const [error, setError] = useState('');

  const load = () => api.get('/auth/users').then(res => setUsers(res.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setForm({ username: '', password: '', role: 'artec' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const updateRole = async (id, role) => {
    await api.put(`/auth/users/${id}`, { role });
    load();
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/auth/users/${id}`);
    load();
  };

  return (
    <div>
      <h1>Administration</h1>

      <div className="card">
        <h3>Créer un compte</h3>
        <form onSubmit={create}>
          <label>Nom d'utilisateur</label>
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <label>Rôle</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" style={{ marginTop: 12 }}>Créer</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div className="card">
        <h3>Utilisateurs</h3>
        <table>
          <thead>
            <tr><th>Username</th><th>Rôle</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>
                  <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <button className="danger" onClick={() => remove(u._id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}