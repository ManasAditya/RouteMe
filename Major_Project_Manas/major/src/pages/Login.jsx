import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleAuthenticationSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setInfoMsg('Account created successfully! Check your inbox for verification links.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An operational error took place during authorization.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={24} color="white" />
            </div>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>RouteMe</span>
          </div>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.95rem' }}>
            {isSignUp ? 'Create your travel workspace account' : 'Log in to track your commutes'}
          </p>
        </div>

        {errorMsg && (
          <div className="message-error mb-20">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div className="message-success mb-20">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleAuthenticationSubmit} className="auth-form">
          <div>
            <label>Email Address</label>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#777' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label>Password</label>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#777' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', color: '#777', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={authLoading} className="primary-btn w-100" style={{ marginTop: '8px' }}>
            {authLoading ? (
              'Processing...'
            ) : (
              <>
                {isSignUp ? 'Sign Up' : 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setInfoMsg(''); }}
            style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500 }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#6b7280', fontSize: '0.85rem' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
