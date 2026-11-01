import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import '../styles/admin.css';

export default function Admin() {
  const [data, setData] = useState({ users: [], unassignedPhotos: [], photoCount: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/admin/users')
      .then(setData)
      .catch((loadError) => setError(loadError.message));
  }, []);

  const { users, unassignedPhotos, photoCount } = data;

  return (
    <section className="admin-page">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">MEDIAVAULT / ADMIN</p>
          <h2>Account overview</h2>
          <p>Registered users and their uploaded photos</p>
        </div>
      </header>

      <div className="admin-metrics" aria-label="Overview totals">
        <div><span>Accounts</span><strong>{users.length}</strong></div>
        <div><span>Photos</span><strong>{photoCount}</strong></div>
        <div><span>Unassigned</span><strong>{unassignedPhotos.length}</strong></div>
      </div>

      {error && <p className="login-error" role="alert">{error}</p>}

      <div className="admin-section-heading">
        <h3>User accounts</h3>
        <span>{users.length} total</span>
      </div>

      {users.length === 0 ? (
        <p className="admin-empty">No user accounts have signed in yet.</p>
      ) : (
        <div className="admin-account-list">
          {users.map((account) => {
            const accountPhotos = account.photos;
            return (
              <article className="admin-account" key={account.email}>
                <div className="admin-account-header">
                  <div className="admin-avatar" aria-hidden="true">
                    {account.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="admin-account-identity">
                    <h4>{account.name || 'User'}</h4>
                    <p>{account.email}</p>
                  </div>
                  <span className="admin-role">{account.role}</span>
                  <span className="admin-photo-count">{accountPhotos.length} photos</span>
                </div>

                {accountPhotos.length ? (
                  <div className="admin-photo-grid">
                    {accountPhotos.map((photo) => (
                      <figure className="admin-photo" key={photo.id}>
                        <img src={photo.url} alt={photo.title} loading="lazy" />
                        <figcaption>
                          <strong>{photo.title}</strong>
                          <span>{photo.category} · {photo.dateAdded}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="admin-no-photos">No uploaded photos</p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {unassignedPhotos.length > 0 && (
        <section className="admin-unassigned">
          <div className="admin-section-heading">
            <h3>Unassigned photos</h3>
            <span>Older photos without uploader details</span>
          </div>
          <div className="admin-photo-grid">
            {unassignedPhotos.map((photo) => (
              <figure className="admin-photo" key={photo.id}>
                <img src={photo.url} alt={photo.title} loading="lazy" />
                <figcaption>
                  <strong>{photo.title}</strong>
                  <span>{photo.category} · {photo.dateAdded}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}