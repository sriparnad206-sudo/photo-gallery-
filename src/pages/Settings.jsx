import { useTheme } from '../hooks/useTheme';
import Button from '../components/common/Button';
import '../styles/settings.css';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="settings-page">
      <header className="page-heading">
        <p className="page-eyebrow">MAKE IT YOURS</p>
        <h2>Settings</h2>
        <p>Personalize your workspace and manage locally saved data.</p>
      </header>

      <section className="settings-card" aria-label="Application settings">
        <div className="setting-row">
          <div className="setting-copy">
            <span className="setting-icon" aria-hidden="true">Aa</span>
            <div>
              <h3>Appearance</h3>
              <p>Currently using {theme} mode. Choose the theme that feels right for your space.</p>
            </div>
          </div>
          <Button onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode
          </Button>
        </div>
        <div className="setting-divider" />
        <div className="setting-row">
          <div className="setting-copy">
            <span className="setting-icon setting-icon-data" aria-hidden="true">↻</span>
            <div>
              <h3>Storage &amp; data</h3>
              <p>Reset locally saved preferences and cached demo data for this application.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="danger"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Reset Application Data
          </Button>
        </div>
      </section>
    </div>
  );
}