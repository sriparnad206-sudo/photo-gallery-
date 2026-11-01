import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import '../styles/login.css';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password, { isAdmin: isAdminLogin, isRegister: isRegistering, name });
      onLoginSuccess(user.role === 'Admin' ? 'admin' : 'home');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <section className="login-aside">
        <div className="login-aside-brand">◉ <span>media</span>vault</div>
        <div className="login-aside-copy">
          <p className="page-eyebrow">YOUR MOMENTS, BEAUTIFULLY KEPT</p>
          <h2>Memories deserve a home.</h2>
          <p>A calmer, more personal place to gather the photos you love.</p>
        </div>
        <p className="login-aside-foot">A little space for all the things worth remembering.</p>
      </section>
      <div className="login-card">
        <h2>{isAdminLogin ? 'Admin Sign In' : isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        <p>{isAdminLogin ? 'Sign in to review user accounts and photos' : isRegistering ? 'Create an account for your personal gallery' : 'Sign in to access your personal gallery'}</p>
        <div className="login-mode" role="group" aria-label="Sign-in type">
          <button type="button" className={!isAdminLogin ? 'active' : ''} onClick={() => { setIsAdminLogin(false); setIsRegistering(false); setError(''); }}>
            User
          </button>
          <button type="button" className={isAdminLogin ? 'active' : ''} onClick={() => { setIsAdminLogin(true); setIsRegistering(false); setError(''); }}>
            Admin
          </button>
        </div>
        {isAdminLogin && !isRegistering && (
          <div className="admin-demo-hint">
            <strong>Demo admin login</strong>
            <span>Email <code>admin@mediavault.local</code></span>
            <span>Password <code>Admin123!</code></span>
            <small>These credentials are for the demo server's administrator account.</small>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="account-name">Name</label>
              <input id="account-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="account-email">Email Address</label>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="account-password">Password</label>
            <input
              id="account-password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={isRegistering ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <Button type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem' }}>
            {isSubmitting ? 'Please wait...' : isRegistering ? 'Create Account' : isAdminLogin ? 'Sign In as Admin' : 'Sign In'}
          </Button>
        </form>
        {!isAdminLogin && (
          <button className="login-switch" type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Already registered? Sign in' : 'New here? Create an account'}
          </button>
        )}
      </div>
    </div>
  );
}