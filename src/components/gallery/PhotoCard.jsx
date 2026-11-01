import { useGallery } from '../../hooks/useGallery';
import { useAuth } from '../../hooks/useAuth';

export default function PhotoCard({ photo, onSelect }) {
  const { toggleFavorite, deletePhoto } = useGallery();
  const { user } = useAuth();
  const canDelete = user?.role === 'Admin' || photo.ownerId === user?.id;

  return (
    <div className="photo-card">
      <img
      src={photo.url}
      alt={photo.title}
      onClick={() => onSelect(photo)}
      loading="lazy"
      />
      <div className="photo-info">
        <div className="photo-header">
          <h3>{photo.title}</h3>
          <span className="photo-tag">{photo.category}</span>
        </div>
        <div className="photo-actions">
          <button 
            className="fav-btn" 
            onClick={() => toggleFavorite(photo.id)}
            title={photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={photo.isFavorite ? `Remove ${photo.title} from favorites` : `Add ${photo.title} to favorites`}
          >
            {photo.isFavorite ? '❤️' : '🤍'}
          </button>
          {canDelete && (
            <button
              className="delete-btn"
              onClick={() => deletePhoto(photo.id)}
              title="Delete photo"
              aria-label={`Delete ${photo.title}`}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}