import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdminToolbar } from './components/AdminToolbar';
import { AdminRoute } from './components/AdminRoute';
import { MasterAdminRoute } from './components/MasterAdminRoute';
import { CanonicalUrl } from './components/CanonicalUrl';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { GalleryProvider } from './context/GalleryContext';
import { BlogProvider } from './context/BlogContext';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Hall = lazy(() => import('./pages/Hall').then(m => ({ default: m.Hall })));
const Churches = lazy(() => import('./pages/Churches').then(m => ({ default: m.Churches })));
const Committee = lazy(() => import('./pages/Committee').then(m => ({ default: m.Committee })));
const Businesses = lazy(() => import('./pages/Businesses').then(m => ({ default: m.Businesses })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(m => ({ default: m.ArticlePage })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminBlog = lazy(() => import('./pages/AdminBlog').then(m => ({ default: m.AdminBlog })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })));

/** Reverse guard: redirects to /hall/events if already logged in */


export default function App() {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <GalleryProvider>
            <BlogProvider>
              <ScrollToTop />
              <CanonicalUrl />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/hall" element={<Hall />} />
                    <Route path="/hall/events" element={<Events />} />
                    <Route path="/churches" element={<Churches />} />
                    <Route path="/committee" element={<Committee />} />
                    <Route path="/businesses" element={<Businesses />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<ArticlePage />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Admin login */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLogin />} />

                    {/* Protected admin routes (wrap future admin-only pages here) */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin/blog" element={<AdminBlog />} />
                    </Route>

                    {/* Master Admin restricted route */}
                    <Route element={<MasterAdminRoute />}>
                      <Route path="/admin/users" element={<AdminUsers />} />
                    </Route>
                  </Routes>
                  </Suspense>
                </main>
                <Footer />
                <AdminToolbar />
              </div>
            </BlogProvider>
          </GalleryProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}
