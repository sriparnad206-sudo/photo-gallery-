import { useGallery } from '../hooks/useGallery';
import PhotoCard from '../components/gallery/PhotoCard';
import '../styles/gallery.css';

export default function Favorites({ onSelectPhoto }) {
  const { photos } = useGallery();
  const favorites = photos.filter((p) => p.isFavorite);

  return (
    <div>
      <header className="page-heading">
        <p className="page-eyebrow">THE ONES YOU LOVE</p>
        <h2>Your favorites</h2>
        <p>A special little collection of your most-loved moments.</p>
      </header>
      {favorites.length === 0 ? (
        <div className="dashboard-empty favorites-empty">
          <span aria-hidden="true">♡</span>
          <h4>Your favorites will live here</h4>
          <p>Tap the heart on any photo to save it to this collection.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {favorites.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onSelect={onSelectPhoto} />
          ))}
        </div>
      )}
    </div>
  );
}