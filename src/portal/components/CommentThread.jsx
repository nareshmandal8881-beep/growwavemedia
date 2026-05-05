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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!submissionId) return;
    const q = query(
      collection(db, 'portal_submissions', submissionId, 'comments'),
      orderBy('createdAt', 'asc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [submissionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const senderName = isAdmin ? 'Admin' : (user?.displayName || user?.email || 'Creator');
    await addDoc(
      collection(db, 'portal_submissions', submissionId, 'comments'),
      {
        text: text.trim(),
        sender: senderName,
        isAdmin: !!isAdmin,
        createdAt: serverTimestamp(),
      },
    );
    setText('');
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
              {c.createdAt?.toDate
                ? c.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
