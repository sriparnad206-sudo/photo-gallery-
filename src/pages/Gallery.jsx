import { useState } from 'react';
import { useGallery } from '../hooks/useGallery';
import PhotoCard from '../components/gallery/PhotoCard';
import PhotoUpload from '../components/gallery/PhotoUpload';
import Button from '../components/common/Button';
import '../styles/gallery.css';

export default function Gallery({ onSelectPhoto }) {
  const { photos } = useGallery();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const categories = ['All', ...new Set(photos.map((p) => p.category))];

  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory = selectedCategory === 'All' || photo.category === selectedCategory;
    const matchesSearch = photo.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="gallery-page">
      <header className="page-heading">
        <p className="page-eyebrow">ALL THE MOMENTS YOU KEEP</p>
        <h2>Your photo library</h2>
        <p>Browse, search, and organize your personal collection.</p>
      </header>
      <div className="gallery-controls">
        <input 
          type="text" 
          className="search-input"
          placeholder="Search photo by title..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />

        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button onClick={() => setIsUploadOpen(true)}>+ Add Photo</Button>
      </div>

      <div className="gallery-grid">
        {filteredPhotos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onSelect={onSelectPhoto} />
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="gallery-empty">
          No photos found matching your search.
        </div>
      )}

      {isUploadOpen && <PhotoUpload onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
}