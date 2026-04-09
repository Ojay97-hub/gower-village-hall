import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Hall } from './pages/Hall';
import { Churches } from './pages/Churches';
import { Committee } from './pages/Committee';
import { Businesses } from './pages/Businesses';
import { Contact } from './pages/Contact';
import { Events } from './pages/Events';
import { Blog } from './pages/Blog';
import { ArticlePage } from './pages/ArticlePage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminBlog } from './pages/AdminBlog';
import { AdminToolbar } from './components/AdminToolbar';
import { AdminRoute } from './components/AdminRoute';
import { MasterAdminRoute } from './components/MasterAdminRoute';
import { AdminUsers } from './pages/AdminUsers';
import { CanonicalUrl } from './components/CanonicalUrl';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { GalleryProvider } from './context/GalleryContext';
import { BlogProvider } from './context/BlogContext';

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

                    {/* Protected admin routes (wrap future admin-only pages here) */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin/blog" element={<AdminBlog />} />
                    </Route>

                    {/* Master Admin restricted route */}
                    <Route element={<MasterAdminRoute />}>
                      <Route path="/admin/users" element={<AdminUsers />} />
                    </Route>
                  </Routes>
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
