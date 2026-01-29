import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Hall } from './pages/Hall';
import { Churches } from './pages/Churches';
import { Committee } from './pages/Committee';
import { Businesses } from './pages/Businesses';
import { Contact } from './pages/Contact';
import { Events } from './pages/Events';
import { AdminLogin } from './pages/AdminLogin';

export default function App() {
  return (
    <Router>
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
