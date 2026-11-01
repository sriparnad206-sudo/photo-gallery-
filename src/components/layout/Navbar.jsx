import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

export default function Navbar({ setCurrentPage }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <button className="brand" onClick={() => setCurrentPage('home')} aria-label="MediaVault home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="15" rx="3" />
            <circle cx="12" cy="12.5" r="3.5" />
            <path d="m7.5 5 1-2h7l1 2" />
          </svg>
        </span>
        <span className="brand-name">media<span>vault</span></span>
      </button>

      <div className="topbar-actions">
        {user ? (
          <>
            <span className="topbar-caption">Your creative space</span>
            <span className="topbar-divider" aria-hidden="true" />
            <div className="topbar-user" title={user.name}>
              <span className="topbar-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
              <span className="topbar-user-name">{user.name || 'Your account'}</span>
            </div>
            <Button
              onClick={toggleTheme}
              variant="secondary"
              style={{ minWidth: '40px', padding: '0.55rem' }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '☼' : '☾'}
            </Button>
            <Button onClick={logout} variant="secondary" className="logout-button">Sign out</Button>
          </>
        ) : (
          <span className="topbar-caption">A home for your best moments</span>
        )}
      </div>
    </header>
  );
}
