import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert } from 'lucide-react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('waveAdminToken', 'authenticated_success');
      navigate('/wave-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please check your email and password or ensure the user is created in Firebase Console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass">
        <div className="login-header">
          <div className="login-icon">
            <Lock size={32} />
          </div>
          <h1>Wave Portal</h1>
          <p>Sign in to access admin dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error"><ShieldAlert size={16} /> {error}</div>}
          
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <User size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="growwavemedia@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
