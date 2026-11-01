import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { id: 'home', label: 'Overview', icon: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-6h5v6' },
  { id: 'gallery', label: 'Photo library', icon: 'M4 4h16v16H4zM8 9h.01M20 15l-5-5L5 19' },
  { id: 'favorites', label: 'Favorites', icon: 'm12 20-1.4-1.3C5.6 14.2 2 11 2 7.1A5.1 5.1 0 0 1 7.2 2a5.7 5.7 0 0 1 4.8 2.6A5.7 5.7 0 0 1 16.8 2 5.1 5.1 0 0 1 22 7.1c0 3.9-3.6 7.1-8.6 11.6L12 20Z' },
  { id: 'profile', label: 'Your profile', icon: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z' },
  { id: 'settings', label: 'Settings', icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64' }
];

export default function Sidebar({ currentPage, setCurrentPage }) {
  const { user } = useAuth();
  const items = user?.role === 'Admin'
    ? [{ id: 'admin', label: 'Administration', icon: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z' }, ...navItems]
    : navItems;

  return (
    <aside className="sidebar">
      <p className="sidebar-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        <ul className="sidebar-nav">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar-link${currentPage === item.id ? ' active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-mark">M</span>
        <span><strong>MediaVault</strong><small>Made for your memories</small></span>
      </div>
    </aside>
  );
}
