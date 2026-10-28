import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  const load = () => api.get('/alerts').then(res => setAlerts(res.data));

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await api.put(`/alerts/${id}/read`);
    load();
  };

  return (
    <div>
      <h1>Alertes</h1>
      {alerts.length === 0 && <p className="card">Aucune alerte.</p>}
      {alerts.map(a => (
        <div key={a._id} className="card" style={{
          borderLeft: `4px solid ${a.isRead ? '#9ca3af' : '#e5484d'}`
        }}>
          <p><strong>Opérateur :</strong> {a.operator}</p>
          <p>{a.message}</p>
          <small>{new Date(a.createdAt).toLocaleString()}</small>
          {!a.isRead && (
            <button onClick={() => markRead(a._id)} style={{ marginTop: 8 }}>
              Marquer comme lue
            </button>
          )}
        </div>
      ))}
    </div>
  );
}