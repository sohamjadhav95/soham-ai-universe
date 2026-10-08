import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TransitionProvider, useShownLocation } from './lib/transition';
import { initScroll } from './lib/scroll';
import Preloader from './components/Preloader';
import Menu from './components/Menu';
import Buddy from './components/buddy/Buddy';
import Home from './pages/Home';
import Work from './pages/Work';
import About from './pages/About';
import Contact from './pages/Contact';
import ProjectPage from './pages/ProjectPage';
import NotFound from './pages/NotFound';

// Hidden test page for choosing the site buddy; loaded only when visited.
const BuddyLab = lazy(() => import('./pages/BuddyLab'));

/** Renders the page on screen, which lags the URL until the curtain covers it. */
function PageRoutes() {
  const location = useShownLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/work" element={<Work />} />
      <Route path="/work/:slug" element={<ProjectPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/lab/buddy"
        element={
          <Suspense fallback={null}>
            <BuddyLab />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    initScroll();
  }, []);

  return (
    <BrowserRouter>
      <TransitionProvider>
        <main>
          <PageRoutes />
        </main>
        <Menu />
        <Buddy />
        <Preloader />
      </TransitionProvider>
    </BrowserRouter>
  );
}
