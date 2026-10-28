import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const OPERATORS = ['yas', 'orange', 'airtel'];
const SOCKET_URL = 'http://localhost:5000';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('yas');
  const socketRef = useRef(null);
  const endRef = useRef(null);

  const isOperator = ['yas', 'orange', 'airtel'].includes(user.role);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join', user._id);

    socketRef.current.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socketRef.current.on('message_sent', (msg) => setMessages(prev => [...prev, msg]));
    socketRef.current.on(`operator_${isOperator ? user.operatorName : target}`, (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socketRef.current?.disconnect();
  }, [user, target]);

  useEffect(() => {
    const query = isOperator ? '' : `?operator=${target}`;
    api.get(`/messages${query}`).then(res => setMessages(res.data));
  }, [target, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    socketRef.current.emit('send_message', {
      senderId: user._id,
      senderUsername: user.username,
      operatorTarget: isOperator ? user.operatorName : target,
      content
    });
    setContent('');
  };

  return (
    <div>
      <h1>Messagerie</h1>

      {!isOperator && (
        <div className="card">
          <label>Canal opérateur</label>
          <select value={target} onChange={e => setTarget(e.target.value)}>
            {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}

      <div className="card" style={{ minHeight: 300, maxHeight: 500, overflowY: 'auto' }}>
        {messages.length === 0 && <p>Aucun message pour le moment.</p>}
        {messages.map((m, i) => (
          <div key={m._id || i} style={{
            padding: 8, margin: '6px 0', borderRadius: 6,
            background: m.senderId === user._id ? '#e3f0ff' : '#f3f4f6',
            textAlign: m.senderId === user._id ? 'right' : 'left'
          }}>
            <strong>{m.senderUsername || 'Utilisateur'}</strong>
            <div>{m.content}</div>
            <small>{new Date(m.createdAt).toLocaleString()}</small>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="card">
        <input value={content} onChange={e => setContent(e.target.value)}
          placeholder="Votre message..." />
        <button type="submit" style={{ marginTop: 8 }}>Envoyer</button>
      </form>
    </div>
  );
}