import { useAuth } from '../hooks/useAuth';
import { useGallery } from '../hooks/useGallery';
import '../styles/profile.css';

export default function Profile() {
  const { user } = useAuth();
  const { photos } = useGallery();

  const userFavoritesCount = photos.filter((p) => p.isFavorite).length;

  return (
    <div className="profile-page">
      <header className="page-heading">
        <p className="page-eyebrow">ACCOUNT DETAILS</p>
        <h2>Your profile</h2>
        <p>A quick look at your account and the memories you have saved.</p>
      </header>

      <section className="profile-card" aria-label="Profile information">
        <div className="profile-avatar" aria-hidden="true">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="profile-identity">
          <h3>{user?.name || 'Your account'}</h3>
          <p>{user?.email}</p>
          <span className="profile-role">{user?.role || 'Member'}</span>
        </div>
      </section>

      <section className="profile-stats" aria-label="Your activity">
        <article className="profile-stat">
          <span className="profile-stat-label">Photos uploaded</span>
          <strong>{photos.length}</strong>
          <span className="profile-stat-note">In your library</span>
        </article>
        <article className="profile-stat">
          <span className="profile-stat-label">Liked photos</span>
          <strong>{userFavoritesCount}</strong>
          <span className="profile-stat-note">Saved favorites</span>
        </article>
      </section>
    </div>
  );
}