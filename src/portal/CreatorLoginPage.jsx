import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';

export default function CreatorLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
      // Verify creator exists in MongoDB
      const res = await fetch(`http://localhost:5000/api/creators/uid/${cred.user.uid}`);
      if (!res.ok) {
        // Auto-heal: If user exists in Auth but MongoDB doc is missing
        await fetch('http://localhost:5000/api/creators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: cred.user.uid,
            name: cred.user.displayName || cred.user.email.split('@')[0],
            email: cred.user.email,
          })
        });
      }
      navigate('/portal/dashboard');
    } catch (err) {
      setError(err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Creator Portal Login | Grow Wave Media</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="portal-auth-bg">
        {/* animated glow orbs */}
        <div className="portal-orb portal-orb--1" />
        <div className="portal-orb portal-orb--2" />

        <div className="portal-auth-card">
          <div className="portal-auth-logo">
            <span className="portal-auth-logo__wave">Wave</span>
            <span className="portal-auth-logo__portal">Portal</span>
          </div>
          <h1 className="portal-auth-title">Creator Login</h1>
          <p className="portal-auth-sub">Sign in to manage your deals and invoices</p>

          <form className="portal-auth-form" onSubmit={handleSubmit} noValidate>
            <div className="portal-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="portal-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="portal-alert portal-alert--error">{error}</div>}

            <button
              type="submit"
              className="portal-btn portal-btn--primary portal-btn--full"
              disabled={loading}
            >
              {loading ? <span className="portal-btn-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="portal-auth-footer">
            Don&apos;t have an account?&nbsp;
            <Link to="/portal/signup">Sign Up</Link>
          </p>
          <Link to="/" className="portal-auth-back">← Back to website</Link>
        </div>
      </div>
    </>
  );
}
