import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import getTheme from './styles/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import MoodPage from './pages/MoodPage';
import JournalPage from './pages/JournalPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WellnessPage from './pages/WellnessPage';

function ProtectedRoute({ children, darkMode, toggleDarkMode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#f1f5f9' : '#1e293b',
            borderRadius: '12px',
            border: '1px solid rgba(124,58,237,0.2)',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthPage isLogin={true} /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><AuthPage isLogin={false} /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><ChatPage /></ProtectedRoute>} />
          <Route path="/mood" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><MoodPage /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><JournalPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/wellness" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><WellnessPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
