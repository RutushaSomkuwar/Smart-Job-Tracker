import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ApplicationFormModal from './components/ApplicationFormModal';
import { applicationService } from './services/applicationService';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetails from './pages/ApplicationDetails';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Profile from './pages/Profile';

const DashboardLayout = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const getPageMeta = () => {
    const path = location.pathname;
    if (path.startsWith('/applications/') && path !== '/applications') {
      return { title: 'Application Details', subtitle: 'Detailed overview & resume match' };
    }
    switch (path) {
      case '/dashboard':
        return { title: 'Pipeline Dashboard', subtitle: 'Real-time overview of your job search' };
      case '/applications':
        return { title: 'Job Applications', subtitle: 'Track and manage all your job opportunities' };
      case '/resume-analyzer':
        return { title: 'Smart Resume Analyzer', subtitle: 'Keyword extraction and job description alignment' };
      case '/profile':
        return { title: 'Account Settings', subtitle: 'User profile & uploaded resume library' };
      default:
        return { title: 'Job Application Tracker', subtitle: 'Smart career management tool' };
    }
  };

  const { title, subtitle } = getPageMeta();

  const handleCreateApplication = async (formData) => {
    try {
      setIsSubmitting(true);
      await applicationService.createApplication(formData);
      setIsModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to create application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={title}
          subtitle={subtitle}
          onAddApplication={() => setIsModalOpen(true)}
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <ApplicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateApplication}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Applications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ApplicationDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResumeAnalyzer />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
