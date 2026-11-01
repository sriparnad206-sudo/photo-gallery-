import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Lightbox from './components/gallery/Lightbox';

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (loading) {
    return <main className="main-content">Checking your session...</main>;
  }

  if (!user) {
    return (
      <div className="app-container auth-app">
        <main className="main-content login-main">
          <Login onLoginSuccess={setCurrentPage} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar setCurrentPage={setCurrentPage} />

      <div className="workspace">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        <main className="main-content">
          {currentPage === 'home' && (
            <Home onNavigate={setCurrentPage} onSelectPhoto={setSelectedPhoto} />
          )}
          {currentPage === 'gallery' && (
            <Gallery onSelectPhoto={setSelectedPhoto} />
          )}
          {currentPage === 'favorites' && (
            <Favorites onSelectPhoto={setSelectedPhoto} />
          )}
          {currentPage === 'profile' && <Profile />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'admin' && user.role === 'Admin' && <Admin />}
        </main>
      </div>

      <Lightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}