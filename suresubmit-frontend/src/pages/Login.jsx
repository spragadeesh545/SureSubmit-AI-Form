import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, Divider,
  InputAdornment, IconButton
} from '@mui/material';
import { Email, Lock, Person, Visibility, VisibilityOff, SmartToy } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', px: { xs: 1, sm: 0 } }}>
      <Paper elevation={0} sx={{
        p: { xs: 3, sm: 5 }, maxWidth: 440, width: '100%',
        border: '1px solid #e2e8f0', borderRadius: 3,
        borderTop: '8px solid #6366f1'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SmartToy sx={{ color: '#6366f1', fontSize: 30 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            SureSubmit
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
          {mode === 'login'
            ? 'Welcome back! Sign in to access your forms.'
            : 'Create an account to start building forms.'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <TextField
              fullWidth label="Full Name" variant="outlined" size="small" sx={{ mb: 2 }}
              value={name} onChange={(e) => setName(e.target.value)} required
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><Person sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment>
              ) }}
            />
          )}
          <TextField
            fullWidth label="Email" type="email" variant="outlined" size="small" sx={{ mb: 2 }}
            value={email} onChange={(e) => setEmail(e.target.value)} required
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><Email sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment>
            ) }}
          />
          <TextField
            fullWidth label="Password" type={showPassword ? 'text' : 'password'} variant="outlined" size="small" sx={{ mb: 3 }}
            value={password} onChange={(e) => setPassword(e.target.value)} required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Lock sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" fullWidth variant="contained" disabled={submitting}
            sx={{
              py: 1.4, backgroundColor: '#6366f1', fontWeight: 700, fontSize: '1rem',
              textTransform: 'none', borderRadius: 2,
              '&:hover': { backgroundColor: '#4f46e5' }
            }}>
            {submitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Button size="small" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            sx={{ textTransform: 'none', color: '#6366f1', fontWeight: 700, minWidth: 0, p: 0 }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;