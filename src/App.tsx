import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TransitionProvider } from './lib/transition';
import { initScroll } from './lib/scroll';
import Preloader from './components/Preloader';
import Menu from './components/Menu';
import Home from './pages/Home';
import Work from './pages/Work';
import About from './pages/About';
import Contact from './pages/Contact';
import ProjectPage from './pages/ProjectPage';
import NotFound from './pages/NotFound';

export default function App() {
  useEffect(() => {
    initScroll();
  }, []);

  return (
    <BrowserRouter>
      <TransitionProvider>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Menu />
        <Preloader />
      </TransitionProvider>
    </BrowserRouter>
  );
}
