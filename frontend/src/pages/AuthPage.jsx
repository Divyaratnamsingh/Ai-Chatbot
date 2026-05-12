import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Person } from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ isLogin = true }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isLogin
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a201b 0%, #242c26 50%, #1a201b 100%)',
      position: 'relative',
      overflow: 'hidden',
      p: 2,
    }}>
      {/* Background decorations */}
      <Box sx={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(15,118,110,0.15), transparent 70%)',
        top: -100, right: -100, animation: 'float 6s ease-in-out infinite',
      }} />
      <Box sx={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,222,128,0.1), transparent 70%)',
        bottom: -50, left: -50, animation: 'float 8s ease-in-out infinite',
      }} />

      <Card sx={{
        width: '100%', maxWidth: 440, position: 'relative', zIndex: 1,
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(15, 118, 110, 0.2)',
        boxShadow: '0 24px 80px rgba(15, 118, 110, 0.15)',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>🧠</Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0f766e, #14b8a6, #4ade80)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MindWell
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isLogin ? 'Welcome back! Sign in to continue' : 'Create your wellness account'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField
                fullWidth label="Full Name" margin="normal" required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                }}
              />
            )}
            <TextField
              fullWidth label="Email Address" type="email" margin="normal" required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
              }}
            />
            <TextField
              fullWidth label="Password" margin="normal" required
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{
                mt: 3, py: 1.5,
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                fontSize: '1rem',
                '&:hover': { background: 'linear-gradient(135deg, #115e59, #0d9488)', transform: 'translateY(-1px)' },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/register' : '/login'}
              style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
