export default function Lightbox({ photo, onClose }) {
  if (!photo) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '2rem'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
      >
        <img 
          src={photo.url} 
          alt={photo.title} 
          style={{ width: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain' }}
        />
        <div style={{ color: '#fff', marginTop: '1rem', textAlign: 'center' }}>
          <h2>{photo.title}</h2>
          <p>{photo.category} • Uploaded on {photo.dateAdded}</p>
        </div>
      </div>
    </div>
  );
}