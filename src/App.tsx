import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AdminToolbar } from './components/AdminToolbar';
import { AdminRoute } from './components/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { GalleryProvider } from './context/GalleryContext';

/** Reverse guard: redirects to /hall/events if already logged in */
function LoginRedirect() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null; // wait for session check
  if (isAdmin) return <Navigate to="/hall/events" replace />;

  return <AdminLogin />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <GalleryProvider>
            <ScrollToTop />
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

                  {/* Admin login with reverse guard */}
                  <Route path="/admin/login" element={<LoginRedirect />} />

                  {/* Protected admin routes (wrap future admin-only pages here) */}
                  <Route element={<AdminRoute />}>
                    {/* Add admin-only routes here, e.g.: */}
                    {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                  </Route>
                </Routes>
              </main>
              <Footer />
              <AdminToolbar />
            </div>
          </GalleryProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}
