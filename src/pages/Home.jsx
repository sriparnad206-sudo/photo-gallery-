import { useGallery } from '../hooks/useGallery';
import { useAuth } from '../hooks/useAuth';
import PhotoCard from '../components/gallery/PhotoCard';
import Button from '../components/common/Button';
import '../styles/home.css';

export default function Home({ onNavigate, onSelectPhoto }) {
  const { photos } = useGallery();
  const { user } = useAuth();

  const totalPhotos = photos.length;
  const totalFavorites = photos.filter((photo) => photo.isFavorite).length;
  const categoriesCount = new Set(photos.map((photo) => photo.category)).size;
  const recentPhotos = [...photos].slice(0, 3);
  const featuredPhoto = recentPhotos[0];

  return (
    <div className="dashboard">
      <header className="page-heading dashboard-heading">
        <div>
          <p className="page-eyebrow">YOUR PERSONAL LIBRARY</p>
          <h2>Good to see you, {user?.name?.split(' ')[0] || 'there'}.</h2>
          <p>Keep the moments that matter, all in one place.</p>
        </div>
        <span className="dashboard-date">A little space for inspiration</span>
      </header>

      {featuredPhoto ? (
        <section className="welcome-hero" aria-label="Featured photo">
          <img className="welcome-hero-image" src={featuredPhoto.url} alt="" />
          <div className="welcome-hero-shade" />
          <div className="welcome-hero-content">
            <span className="hero-kicker"><span /> YOUR COLLECTION, YOUR WAY</span>
            <h3>A beautiful place<br />for every memory.</h3>
            <p>Browse your collection and rediscover something wonderful.</p>
            <Button onClick={() => onNavigate('gallery')} className="hero-button">
              Explore your library <span aria-hidden="true">↗</span>
            </Button>
          </div>
          <span className="hero-photo-label">{featuredPhoto.title}</span>
        </section>
      ) : (
        <section className="welcome-hero welcome-hero-empty">
          <div className="welcome-hero-content">
            <span className="hero-kicker"><span /> YOUR COLLECTION, YOUR WAY</span>
            <h3>Your next favorite<br />photo starts here.</h3>
            <p>Start building a collection of the moments you want to keep.</p>
            <Button onClick={() => onNavigate('gallery')} className="hero-button">
              Open your library <span aria-hidden="true">↗</span>
            </Button>
          </div>
        </section>
      )}

      <section className="dashboard-stats" aria-label="Collection summary">
        <article className="stat-card">
          <span className="stat-icon stat-icon-photo" aria-hidden="true">▧</span>
          <div><p>Photos in your library</p><strong>{totalPhotos}</strong></div>
          <span className="stat-note">MEMORIES</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-favorite" aria-hidden="true">♡</span>
          <div><p>Saved as favorites</p><strong>{totalFavorites}</strong></div>
          <span className="stat-note">KEEPERS</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-category" aria-hidden="true">◈</span>
          <div><p>Unique collections</p><strong>{categoriesCount}</strong></div>
          <span className="stat-note">CATEGORIES</span>
        </article>
      </section>

      <section className="recent-section">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">FRESHLY ADDED</p>
            <h3>Recent memories</h3>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('gallery')}>
            View all photos <span aria-hidden="true">→</span>
          </Button>
        </div>
        {recentPhotos.length > 0 ? (
          <div className="gallery-grid">
            {recentPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onSelect={onSelectPhoto} />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <span aria-hidden="true">▧</span>
            <h4>Your story starts with a photo</h4>
            <p>Add a photo to begin building your personal collection.</p>
            <Button onClick={() => onNavigate('gallery')}>Go to photo library</Button>
          </div>
        )}
      </section>
    </div>
  );
}
