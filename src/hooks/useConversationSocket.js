import { useEffect, useState } from 'react';
import api from '../services/api';

export function useConversationSocket(conversationId, onMessage) {
  const [status, setStatus] = useState('connecting');
  useEffect(() => {
    let active = true;
    let socket;
    let timer;
    let attempt = 0;
    const identifier = JSON.stringify({ channel: 'ConversationChannel', conversation_id: conversationId });
    const reconnect = () => { if (active) { setStatus('reconnecting'); timer = setTimeout(connect, Math.min(15000, 1500 * 2 ** attempt++)); } };
    const connect = async () => {
      try {
        const response = await api.post('/cable_ticket');
        if (!active) return;
        const base = (process.env.EXPO_PUBLIC_WS_URL || api.defaults.baseURL.replace(/^http/, 'ws').replace(/\/$/, '') + '/cable');
        socket = new WebSocket(`${base}?ticket=${encodeURIComponent(response.data.ticket)}`, ['actioncable-v1-json']);
        socket.onopen = () => socket.send(JSON.stringify({ command: 'subscribe', identifier }));
        socket.onmessage = event => {
          if (!active) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'confirm_subscription') { attempt = 0; setStatus('connected'); }
            if (payload.type === 'reject_subscription') { setStatus('denied'); socket.close(); return; }
            if (payload.identifier === identifier && payload.message) onMessage(payload.message);
          } catch { /* Um frame inválido não altera a conversa. */ }
        };
        socket.onclose = reconnect;
        socket.onerror = () => socket.close();
      } catch { reconnect(); }
    };
    connect();
    return () => { active = false; clearTimeout(timer); if (socket) { socket.onclose = null; socket.close(); } };
  }, [conversationId, onMessage]);
  return status;
}

