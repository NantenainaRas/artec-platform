import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, Users, Activity, Star, Calendar,
  Radio, Signal, Wifi, MapPin, Sparkles, RefreshCw, Clock
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import './Dashboard.css';

// Couleur en fonction du score
const scoreColor = (s) => {
  if (s == null || s === 0) return '#9ca3af';
  if (s < 4) return '#ef4444';
  if (s < 7) return '#f59e0b';
  return '#10b981';
};

// Compteur animé
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const startVal = display;
    const diff = value - startVal;
    let raf;
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(startVal + diff * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [value]);
  return <>{typeof value === 'number' && !Number.isInteger(value) ? display.toFixed(1) : Math.round(display)}</>;
}

// Carte KPI
function KpiCard({ icon: Icon, label, value, suffix = '', color = '#6366f1', subtext = '' }) {
  return (
    <div className="kpi-card" style={{ '--kpi-color': color }}>
      <div className="kpi-icon-wrap">
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">
          <AnimatedNumber value={value} />
          {suffix && <span className="kpi-suffix">{suffix}</span>}
        </div>
        {subtext && <div className="kpi-subtext">{subtext}</div>}
      </div>
    </div>
  );
}

// Tooltip personnalisé pour les graphiques
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-row" style={{ color: p.color || p.fill }}>
          <span>{p.name}</span>
          <strong>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');

  const load = async (p = period) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/dashboard?period=${p}`);
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period); /* eslint-disable-next-line */ }, [period]);

  if (error) return <div className="dashboard-page"><div className="error-box">{error}</div></div>;
  if (!stats) return <div className="dashboard-page"><div className="loading-box">Chargement...</div></div>;

  const isOperator = ['yas', 'orange', 'airtel'].includes(user.role);
  const summary = stats.summary;
  const pieData = [
    { name: 'Bonne', value: summary.bonne, color: '#10b981' },
    { name: 'Moyenne', value: summary.moyenne, color: '#f59e0b' },
    { name: 'Mauvaise', value: summary.mauvaise, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const hasAiData = summary.bonne + summary.moyenne + summary.mauvaise > 0;

  return (
    <div className="dashboard-page">
      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Tableau de bord
            <span className="role-badge">{user.role}</span>
          </h1>
          <p className="dashboard-subtitle">
            {isOperator
              ? `Vue des performances de votre réseau ${user.operatorName}`
              : 'Vue globale de la qualité des services télécoms à Madagascar'}
          </p>
        </div>
        <div className="header-actions">
          <div className="period-selector">
            {[
              { v: '7', label: '7 jours' },
              { v: '30', label: '30 jours' },
              { v: 'all', label: 'Tout' }
            ].map(o => (
              <button
                key={o.v}
                className={`period-btn ${period === o.v ? 'active' : ''}`}
                onClick={() => setPeriod(o.v)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button className="btn-refresh" onClick={() => load()} title="Rafraîchir">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="kpi-grid">
        <KpiCard
          icon={Users}
          label="Total sondages"
          value={summary.total}
          color="#6366f1"
          subtext={`Période : ${period === 'all' ? 'tout' : period + ' jours'}`}
        />
        <KpiCard
          icon={Star}
          label="Score moyen"
          value={summary.avgScore || 0}
          suffix="/10"
          color={scoreColor(summary.avgScore)}
          subtext={
            summary.avgScore >= 7 ? 'Qualité perçue : bonne'
            : summary.avgScore >= 4 ? 'Qualité perçue : moyenne'
            : 'Qualité perçue : mauvaise'
          }
        />
        <KpiCard
          icon={Activity}
          label="Sondages 'Bonne qualité'"
          value={summary.bonne}
          color="#10b981"
          subtext={hasAiData ? 'Classés par l\'IA' : 'IA pas encore activée'}
        />
        <KpiCard
          icon={TrendingUp}
          label="Sondages 'Mauvaise qualité'"
          value={summary.mauvaise}
          color="#ef4444"
          subtext={hasAiData ? 'Classés par l\'IA' : 'IA pas encore activée'}
        />
      </div>

      {/* Ligne 1 : Timeline + Pie */}
      <div className="dashboard-row">
        <div className="dashboard-card large">
          <div className="card-header">
            <h3>
              <Calendar size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Évolution du score moyen
            </h3>
            <span className="card-badge">{stats.timeline.length} jour(s)</span>
          </div>
          {stats.timeline.length === 0 ? (
            <div className="empty-state">Pas de données sur cette période.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.timeline}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" fontSize={12} />
                <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  name="Score moyen"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#667eea', strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  fill="url(#lineGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <Sparkles size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Qualité perçue par l'IA
            </h3>
          </div>
          {!hasAiData ? (
            <div className="empty-state">
              Les classifications IA apparaîtront ici
              <br />
              <small>Le module IA sera activé prochainement.</small>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ligne 2 : par opérateur + par réseau */}
      <div className="dashboard-row">
        {!isOperator && (
          <div className="dashboard-card large">
            <div className="card-header">
              <h3>
                <Radio size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Score moyen par opérateur
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.byOperator} barSize={48}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" fontSize={12} />
                <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="avgScore"
                  name="Score moyen"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className={`dashboard-card ${isOperator ? 'large' : ''}`}>
          <div className="card-header">
            <h3>
              <Signal size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Score moyen par réseau
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.byNetwork} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="_id" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgScore" name="Score moyen" radius={[8, 8, 0, 0]}>
                {stats.byNetwork.map((entry, i) => {
                  const colors = { '2G': '#94a3b8', '3G': '#60a5fa', '4G': '#34d399', '5G': '#a78bfa' };
                  return <Cell key={i} fill={colors[entry._id] || '#667eea'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ligne 3 : par service */}
      <div className="dashboard-card full">
        <div className="card-header">
          <h3>
            <Wifi size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Score moyen par service
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.byService} barSize={60}>
            <defs>
              <linearGradient id="serviceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="_id" stroke="#6b7280" fontSize={12} />
            <YAxis domain={[0, 10]} stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgScore" name="Score moyen" fill="url(#serviceGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ligne 4 : derniers sondages */}
      <div className="dashboard-card full">
        <div className="card-header">
          <h3>
            <Clock size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Derniers sondages
          </h3>
          <span className="card-badge">5 plus récents</span>
        </div>
        {stats.latestSurveys.length === 0 ? (
          <div className="empty-state">Aucun sondage pour le moment.</div>
        ) : (
          <div className="table-wrapper">
            <table className="surveys-table">
              <thead>
                <tr>
                  <th>Opérateur</th>
                  <th>Service</th>
                  <th>Réseau</th>
                  <th>Localisation</th>
                  <th>Note</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.latestSurveys.map(s => (
                  <tr key={s._id}>
                    <td><span className="op-tag">{s.operator}</span></td>
                    <td>{s.service}</td>
                    <td><span className="net-tag">{s.network}</span></td>
                    <td><MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{s.location}</td>
                    <td>
                      <span
                        className="score-pill"
                        style={{
                          background: `${scoreColor(s.score)}20`,
                          color: scoreColor(s.score),
                          border: `1px solid ${scoreColor(s.score)}40`
                        }}
                      >
                        {s.score}/10
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(s.submittedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}