import { useState, useEffect } from 'react';
import {
  Signal,
  Wifi,
  Phone,
  MessageSquare,
  Briefcase,
  Radio,
  MapPin,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Gauge
} from 'lucide-react';
import api from '../api/axios';
import './PublicSurvey.css';

const SERVICES = [
  { value: 'Internet mobile', label: 'Internet mobile', Icon: Wifi },
  { value: 'Appels',          label: 'Appels',          Icon: Phone },
  { value: 'SMS',             label: 'SMS',             Icon: MessageSquare },
  { value: 'Data pro',        label: 'Data pro',        Icon: Briefcase }
];

const NETWORKS = [
  { value: '2G', color: '#94a3b8' },
  { value: '3G', color: '#60a5fa' },
  { value: '4G', color: '#34d399' },
  { value: '5G', color: '#a78bfa' }
];

const OPERATORS = [
  { value: 'yas',    label: 'Yas',    color: '#f97316', Icon: Radio },
  { value: 'orange', label: 'Orange', color: '#f59e0b', Icon: Signal },
  { value: 'airtel', label: 'Airtel', color: '#dc2626', Icon: Signal }
];

export default function PublicSurvey() {
  const [form, setForm] = useState({
    operator: 'yas',
    service: 'Internet mobile',
    network: '4G',
    score: 5,
    location: '',
    comment: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [stepKey, setStepKey] = useState(0);

  useEffect(() => {
    setStepKey(k => k + 1);
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      await api.post('/surveys', form);
      setMessage('Merci ! Votre avis a bien été enregistré.');
      setForm({ ...form, score: 5, location: '', comment: '' });
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  const scoreColor = (s) => {
    if (s <= 3) return '#ef4444';
    if (s <= 6) return '#f59e0b';
    return '#10b981';
  };

  const scoreLabel = (s) => {
    if (s <= 3) return 'Très mauvais';
    if (s <= 5) return 'Mauvais';
    if (s <= 7) return 'Moyen';
    if (s <= 9) return 'Bon';
    return 'Excellent';
  };

  const canSubmit = () => form.location.trim().length >= 2;

  return (
    <div className="survey-page">
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />

      <div className="survey-card">
        {/* EN-TÊTE */}
        <div className="survey-header">
          <div className="survey-logo">
            <Radio size={44} strokeWidth={2.2} />
          </div>
          <h1>Votre avis compte</h1>
          <p className="survey-subtitle">
            Aidez-nous à améliorer la qualité des services télécoms à Madagascar
          </p>
          <div className="survey-progress">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`progress-dot ${step >= i ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="survey-form">
          {/* ÉTAPE 1 : OPÉRATEUR */}
          {step === 1 && (
            <div className="survey-step" key={`step-${stepKey}`}>
              <h2 className="step-title">Quel opérateur utilisez-vous ?</h2>
              <div className="options-grid">
                {OPERATORS.map((op, i) => {
                  const Icon = op.Icon;
                  return (
                    <button
                      type="button"
                      key={op.value}
                      className={`option-card ${form.operator === op.value ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, operator: op.value })}
                      style={{
                        '--accent': op.color,
                        animationDelay: `${i * 80}ms`
                      }}
                    >
                      <span className="option-emoji">
                        <Icon size={36} strokeWidth={2} />
                      </span>
                      <span className="option-label">{op.label}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="btn-next" onClick={() => setStep(2)}>
                Continuer <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
              </button>
            </div>
          )}

          {/* ÉTAPE 2 : SERVICE */}
          {step === 2 && (
            <div className="survey-step" key={`step-${stepKey}`}>
              <h2 className="step-title">Quel service évaluez-vous ?</h2>
              <div className="options-grid">
                {SERVICES.map((s, i) => {
                  const Icon = s.Icon;
                  return (
                    <button
                      type="button"
                      key={s.value}
                      className={`option-card ${form.service === s.value ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, service: s.value })}
                      style={{ '--accent': '#6366f1', animationDelay: `${i * 80}ms` }}
                    >
                      <span className="option-emoji">
                        <Icon size={36} strokeWidth={2} />
                      </span>
                      <span className="option-label">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Retour
                </button>
                <button type="button" className="btn-next" onClick={() => setStep(3)}>
                  Continuer <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : RÉSEAU */}
          {step === 3 && (
            <div className="survey-step" key={`step-${stepKey}`}>
              <h2 className="step-title">Sur quel réseau étiez-vous ?</h2>
              <div className="network-grid">
                {NETWORKS.map((n, i) => (
                  <button
                    type="button"
                    key={n.value}
                    className={`network-card ${form.network === n.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, network: n.value })}
                    style={{ '--accent': n.color, animationDelay: `${i * 80}ms` }}
                  >
                    <span className="network-badge" style={{ background: n.color }}>
                      {n.value}
                    </span>
                  </button>
                ))}
              </div>
              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Retour
                </button>
                <button type="button" className="btn-next" onClick={() => setStep(4)}>
                  Continuer <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : NOTE */}
          {step === 4 && (
            <div className="survey-step" key={`step-${stepKey}`}>
              <h2 className="step-title">Quelle note donnez-vous ?</h2>
              <div className="score-display" style={{ color: scoreColor(form.score) }}>
                <Gauge size={32} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                <span className="score-value">{form.score}</span>
                <span className="score-max">/10</span>
              </div>
              <p className="score-label" style={{ color: scoreColor(form.score) }}>
                {scoreLabel(form.score)}
              </p>

              <div className="score-slider-wrapper">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={form.score}
                  onChange={e => setForm({ ...form, score: Number(e.target.value) })}
                  className="score-slider"
                />
                <div className="score-dots">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <span
                      key={n}
                      className={`score-dot ${n === form.score ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, score: n })}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => setStep(3)}>
                  <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Retour
                </button>
                <button type="button" className="btn-next" onClick={() => setStep(5)}>
                  Continuer <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 5 : LOCALISATION + COMMENTAIRE */}
          {step === 5 && (
            <div className="survey-step" key={`step-${stepKey}`}>
              <h2 className="step-title">Où étiez-vous ?</h2>

              <div className="input-group">
                <label>
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Localisation *
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Antananarivo, Toamasina..."
                  required
                />
              </div>

              <div className="input-group">
                <label>Commentaire (optionnel)</label>
                <textarea
                  rows="3"
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  placeholder="Décrivez votre expérience..."
                />
              </div>

              <div className="recap-card">
                <p className="recap-title">
                  <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Récapitulatif
                </p>
                <div className="recap-row">
                  <span>Opérateur</span>
                  <strong>{OPERATORS.find(o => o.value === form.operator)?.label}</strong>
                </div>
                <div className="recap-row">
                  <span>Service</span>
                  <strong>{form.service}</strong>
                </div>
                <div className="recap-row">
                  <span>Réseau</span>
                  <strong>{form.network}</strong>
                </div>
                <div className="recap-row">
                  <span>Note</span>
                  <strong style={{ color: scoreColor(form.score) }}>
                    {form.score}/10
                  </strong>
                </div>
              </div>

              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => setStep(4)}>
                  <ArrowLeft size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Retour
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!canSubmit() || submitting}
                >
                  {submitting ? (
                    <>Envoi...</>
                  ) : (
                    <>
                      <Send size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {message}
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}
        </form>

        <div className="survey-footer">
          <Lock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Vos données sont anonymes et sécurisées
        </div>
      </div>
    </div>
  );
}