import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/auth/ChangePassword';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import Services from './pages/dashboard/Services';
import Applications from './pages/dashboard/Applications';
import Users from './pages/dashboard/Users';
import RegisterUser from './pages/dashboard/RegisterUser';

// Placeholder Pages (to be fully implemented)
import {
  Hero,
  About,
  Stats,
  Projects,
  Workflow,
  Partners,
  Testimonials,
  ContactInfo,
  Socials,
  MapUrl,
  Languages,
} from './pages/dashboard/PlaceholderPages';

// Global styles
import './assets/scss/main.scss';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Home */}
              <Route index element={<Dashboard />} />

              {/* Profile */}
              <Route path="profile" element={<Profile />} />

              {/* Content Management (Both Admin & SuperAdmin) */}
              <Route path="hero" element={<Hero />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="stats" element={<Stats />} />
              <Route path="projects" element={<Projects />} />
              <Route path="workflow" element={<Workflow />} />
              <Route path="partners" element={<Partners />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="contact-info" element={<ContactInfo />} />
              <Route path="socials" element={<Socials />} />
              <Route path="map-url" element={<MapUrl />} />
              <Route path="applications" element={<Applications />} />
              <Route path="languages" element={<Languages />} />

              {/* SuperAdmin Only Routes */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/new"
                element={
                  <ProtectedRoute requireSuperAdmin>
                    <RegisterUser />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
