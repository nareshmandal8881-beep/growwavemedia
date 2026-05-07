import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';

export default function CreatorSignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', channelName: '', youtubeLink: '', instagramLink: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // 2. Update display name
      await updateProfile(cred.user, { displayName: form.name });

      // 3. Create document in Firestore
      await setDoc(doc(db, 'portal_creators', cred.user.uid), {
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        channelName: form.channelName,
        youtubeLink: form.youtubeLink,
        instagramLink: form.instagramLink,
        createdAt: serverTimestamp()
      });

      // 4. Redirect to dashboard
      navigate('/portal/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Creator Portal Signup | Grow Wave Media</title>
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
          <h1 className="portal-auth-title">Creator Signup</h1>
          <p className="portal-auth-sub">Create your account to start managing deals</p>

          <form className="portal-auth-form" onSubmit={handleSubmit} noValidate>
            <div className="portal-field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            
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
              <label htmlFor="channelName">Channel / Creator Name</label>
              <input
                id="channelName"
                name="channelName"
                type="text"
                placeholder="e.g. CarryMinati"
                value={form.channelName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="portal-field">
              <label htmlFor="youtubeLink">YouTube Channel Link</label>
              <input
                id="youtubeLink"
                name="youtubeLink"
                type="url"
                placeholder="https://youtube.com/@username"
                value={form.youtubeLink}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="portal-field">
              <label htmlFor="instagramLink">Instagram Profile Link</label>
              <input
                id="instagramLink"
                name="instagramLink"
                type="url"
                placeholder="https://instagram.com/username"
                value={form.instagramLink}
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
                autoComplete="new-password"
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
              {loading ? <span className="portal-btn-spinner" /> : 'Sign Up'}
            </button>
          </form>

          <p className="portal-auth-footer">
            Already have an account?&nbsp;
            <Link to="/portal/login">Log In</Link>
          </p>
          <Link to="/" className="portal-auth-back">← Back to website</Link>
        </div>
      </div>
    </>
  );
}
