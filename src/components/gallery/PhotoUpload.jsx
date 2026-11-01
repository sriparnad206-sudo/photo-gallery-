import { useState } from 'react';
import { useGallery } from '../../hooks/useGallery';
import Button from '../common/Button';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function PhotoUpload({ onClose }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Nature');
  const [fileUrl, setFileUrl] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { addPhoto } = useGallery();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be under 2MB.');
      return;
    }

    setIsConverting(true);
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result);
      setIsConverting(false);
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
      setIsConverting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl || isConverting || isSaving) return;

    setIsSaving(true);
    setError('');
    try {
      await addPhoto({ title, category, url: fileUrl });
      onClose();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        border: '1px solid var(--border)'
      }}>
        <h2>Upload Your Photo</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Photo title"
              required 
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="Nature">Nature</option>
              <option value="Architecture">Architecture</option>
              <option value="Tech">Tech</option>
              <option value="Art">Art</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div className="form-group">
            <label>Select Local Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              required 
            />
          </div>
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
          )}
          {(isConverting || isSaving) && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Processing image...</p>
          )}
          {fileUrl && !isConverting && (
            <img 
              src={fileUrl} 
              alt="Preview" 
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '1rem' }} 
            />
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isConverting || isSaving || !fileUrl}>{isSaving ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}