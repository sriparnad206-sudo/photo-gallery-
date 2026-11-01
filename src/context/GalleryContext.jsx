import { useEffect, useState } from 'react';
import { GalleryContext } from './GalleryContextDef';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/api';

export const GalleryProvider = ({ children }) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setPhotos([]);
      setError('');
      return undefined;
    }

    let active = true;
    apiRequest('/photos')
      .then(({ photos: nextPhotos }) => {
        if (active) setPhotos(nextPhotos);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });

    return () => { active = false; };
  }, [user?.id]);

  const addPhoto = async (newPhoto) => {
    const { photo } = await apiRequest('/photos', {
      method: 'POST',
      body: JSON.stringify(newPhoto),
    });
    setPhotos((previousPhotos) => [photo, ...previousPhotos]);
  };

  const toggleFavorite = async (id) => {
    try {
      const { isFavorite } = await apiRequest(`/photos/${id}/favorite`, { method: 'PUT' });
      setPhotos((previousPhotos) => previousPhotos.map((photo) =>
        photo.id === id ? { ...photo, isFavorite } : photo
      ));
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  const deletePhoto = async (id) => {
    try {
      await apiRequest(`/photos/${id}`, { method: 'DELETE' });
      setPhotos((previousPhotos) => previousPhotos.filter((photo) => photo.id !== id));
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  return (
    <GalleryContext.Provider value={{ photos, addPhoto, toggleFavorite, deletePhoto, error }}>
      {children}
    </GalleryContext.Provider>
  );
};
