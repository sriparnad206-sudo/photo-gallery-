import { useContext } from 'react';
import { GalleryContext } from '../context/GalleryContextDef';

export const useGallery = () => useContext(GalleryContext);
