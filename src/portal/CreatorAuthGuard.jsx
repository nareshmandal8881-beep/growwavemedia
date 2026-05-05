import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function CreatorAuthGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setStatus(user ? 'auth' : 'unauth');
    });
    return unsub;
  }, []);

  if (status === 'loading') {
    return (
      <div className="portal-loading">
        <div className="portal-spinner" />
        <p>Checking session…</p>
      </div>
    );
  }

  if (status === 'unauth') {
    return <Navigate to="/portal/login" replace />;
  }

  return children;
}
