import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="nav">
      <div>
        <strong>ARTEC Madagascar</strong>
        <Link to="/">Sondage</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && <Link to="/offers">Offres</Link>}
        {user && <Link to="/messages">Messagerie</Link>}
        {user && <Link to="/alerts">Alertes</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>{user.username} ({user.role})</span>
            <button className="danger" onClick={() => { logout(); navigate('/login'); }}>
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/login">Connexion</Link>
        )}
      </div>
    </div>
  );
}