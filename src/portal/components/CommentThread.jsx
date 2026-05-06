import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../firebase';
import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CommentThread({ submissionId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const fetchComments = async () => {
    if (!submissionId) return;
    try {
      const res = await fetch(`${API_BASE}/comments/submission/${submissionId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Fetch Comments Error:", err);
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, [submissionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const senderName = isAdmin ? 'Admin' : (user?.displayName || user?.email || 'Creator');
    
    try {
      await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          text: text.trim(),
          sender: senderName,
          isAdmin: !!isAdmin
        })
      });
      setText('');
      fetchComments();
    } catch (err) {
      console.error("Send Comment Error:", err);
    }
  };

  return (
    <div className="comment-thread">
      <h4 className="comment-thread__title">Messages</h4>
      <div className="comment-thread__messages">
        {comments.length === 0 && (
          <p className="comment-thread__empty">No messages yet.</p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`comment-bubble ${c.isAdmin ? 'comment-bubble--admin' : 'comment-bubble--creator'}`}
          >
            <span className="comment-bubble__sender">{c.sender}</span>
            <p className="comment-bubble__text">{c.text}</p>
            <span className="comment-bubble__time">
              {c.createdAt
                ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="comment-thread__form" onSubmit={send}>
        <input
          className="comment-thread__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button type="submit" className="portal-btn portal-btn--primary comment-thread__send">
          Send
        </button>
      </form>
    </div>
  );
}
