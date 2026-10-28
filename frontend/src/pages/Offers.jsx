import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, X, Package, Wifi, Clock, Tag, Filter,
  Radio, Signal, Search, Inbox, Save, AlertCircle, CheckCircle2, Coins
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import './Offers.css';

const OPERATORS = [
  { value: 'yas',    label: 'Yas',    color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { value: 'orange', label: 'Orange', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { value: 'airtel', label: 'Airtel', color: '#dc2626', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' }
];

const EMPTY_FORM = {
  operator: 'yas',
  title: '',
  description: '',
  price: 0,
  dataVolume: '',
  validity: ''
};

export default function Offers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isOperator = ['yas', 'orange', 'airtel'].includes(user.role);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      setOffers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Reset success après 3s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, operator: isOperator ? user.operatorName : 'yas' });
    setModalOpen(true);
    setError('');
  };

  const openEdit = (offer) => {
    setEditingId(offer._id);
    setForm({
      operator: offer.operator,
      title: offer.title,
      description: offer.description || '',
      price: offer.price || 0,
      dataVolume: offer.dataVolume || '',
      validity: offer.validity || ''
    });
    setModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/offers/${editingId}`, form);
        setSuccess('Offre mise à jour avec succès.');
      } else {
        await api.post('/offers', form);
        setSuccess('Offre créée avec succès.');
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer définitivement cette offre ?')) return;
    try {
      await api.delete(`/offers/${id}`);
      setSuccess('Offre supprimée.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filtered = offers.filter(o => {
    if (filter !== 'all' && o.operator !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        (o.description || '').toLowerCase().includes(q) ||
        (o.dataVolume || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getOperatorMeta = (op) => OPERATORS.find(o => o.value === op) || OPERATORS[0];

  return (
    <div className="offers-page">
      {/* En-tête */}
      <div className="offers-header">
        <div>
          <h1 className="offers-title">
            <Package size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Offres télécoms
          </h1>
          <p className="offers-subtitle">
            {isOperator
              ? `Gérez les offres de ${user.operatorName}`
              : 'Gestion des offres de tous les opérateurs'}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Nouvelle offre
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="offers-toolbar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une offre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {!isOperator && (
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <button
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Toutes
            </button>
            {OPERATORS.map(op => (
              <button
                key={op.value}
                className={`filter-chip ${filter === op.value ? 'active' : ''}`}
                onClick={() => setFilter(op.value)}
                style={filter === op.value ? { '--chip-color': op.color } : {}}
              >
                {op.label}
              </button>
            ))}
          </div>
        )}

        <span className="offers-count">
          {filtered.length} offre{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
      {error && !modalOpen && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="offers-loading">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="offers-empty">
          <Inbox size={64} strokeWidth={1.5} />
          <h3>Aucune offre trouvée</h3>
          <p>
            {search || filter !== 'all'
              ? 'Essayez de modifier vos filtres.'
              : 'Créez votre première offre pour commencer.'}
          </p>
          {!search && filter === 'all' && (
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={18} />
              Créer une offre
            </button>
          )}
        </div>
      ) : (
        <div className="offers-grid">
          {filtered.map((offer, i) => {
            const meta = getOperatorMeta(offer.operator);
            return (
              <div
                key={offer._id}
                className="offer-card"
                style={{
                  '--op-color': meta.color,
                  '--op-gradient': meta.gradient,
                  animationDelay: `${i * 60}ms`
                }}
              >
                <div className="offer-card-header" style={{ background: meta.gradient }}>
                  <div className="offer-op">
                    <Signal size={16} />
                    <span>{meta.label}</span>
                  </div>
                  <div className="offer-actions">
                    <button
                      className="icon-btn"
                      onClick={() => openEdit(offer)}
                      title="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(offer._id)}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="offer-card-body">
                  <h3 className="offer-title">{offer.title}</h3>
                  {offer.description && (
                    <p className="offer-desc">{offer.description}</p>
                  )}

                  <div className="offer-specs">
                    {offer.dataVolume && (
                      <div className="spec">
                        <Wifi size={14} />
                        <span>{offer.dataVolume}</span>
                      </div>
                    )}
                    {offer.validity && (
                      <div className="spec">
                        <Clock size={14} />
                        <span>{offer.validity}</span>
                      </div>
                    )}
                    {offer.price > 0 && (
                      <div className="spec">
                        <Coins size={14} />
                        <span>{offer.price.toLocaleString('fr-FR')} Ar</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="offer-card-footer">
                  <Tag size={12} />
                  <span className={`status-badge ${offer.isActive ? 'active' : 'inactive'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal création/édition */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                {editingId ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Opérateur *</label>
                  <select
                    value={form.operator}
                    onChange={(e) => setForm({ ...form, operator: e.target.value })}
                    disabled={isOperator || !!editingId}
                    required
                  >
                    {OPERATORS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Prix (Ar)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Titre de l'offre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Pack Internet 5Go"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez l'offre en détail..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Volume data</label>
                  <input
                    type="text"
                    value={form.dataVolume}
                    onChange={(e) => setForm({ ...form, dataVolume: e.target.value })}
                    placeholder="Ex: 5 Go"
                  />
                </div>

                <div className="form-group">
                  <label>Validité</label>
                  <input
                    type="text"
                    value={form.validity}
                    onChange={(e) => setForm({ ...form, validity: e.target.value })}
                    placeholder="Ex: 30 jours"
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? (
                    'Enregistrement...'
                  ) : (
                    <>
                      <Save size={16} />
                      {editingId ? 'Enregistrer' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}