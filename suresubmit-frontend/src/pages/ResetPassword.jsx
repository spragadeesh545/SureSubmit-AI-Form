import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, LinearProgress
} from '@mui/material';
import { Lock, SmartToy, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.ok) {
        setDone(true);
        return;
      }

      if (response.status === 410) {
        setError('This reset link has expired. Please request a new one.');
      } else if (response.status === 400) {
        setError('This reset link is invalid or has already been used.');
      } else {
        setError('Could not reset your password. Please try again.');
      }
    } catch (err) {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', px: { xs: 1, sm: 0 } }}>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 5 }, maxWidth: 440, width: '100%',
          border: '1px solid #e2e8f0', borderRadius: 3, borderTop: '8px solid #ef4444'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Invalid reset link
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
            This page needs a reset token. Open the link from your password reset email.
          </Typography>
          <Button fullWidth variant="contained" component={Link} to="/forgot-password"
            sx={{ py: 1.2, textTransform: 'none', fontWeight: 700, borderRadius: 2, backgroundColor: '#6366f1' }}>
            Request a new link
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', px: { xs: 1, sm: 0 } }}>
      <Paper elevation={0} sx={{
        p: { xs: 3, sm: 5 }, maxWidth: 440, width: '100%',
        border: '1px solid #e2e8f0', borderRadius: 3,
        borderTop: `8px solid ${done ? '#10b981' : '#6366f1'}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SmartToy sx={{ color: '#6366f1', fontSize: 30 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            SureSubmit
          </Typography>
        </Box>

        {done ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle sx={{ color: '#10b981' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Password updated
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Your password has been changed and other devices have been signed out.
            </Typography>
            <Button fullWidth variant="contained" onClick={() => navigate('/login')}
              sx={{ py: 1.2, textTransform: 'none', fontWeight: 700, borderRadius: 2, backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}>
              Sign In
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Choose a new password for your account.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth label="New Password" type={showPassword ? 'text' : 'password'}
                variant="outlined" size="small" sx={{ mb: 2 }}
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
              <TextField
                fullWidth label="Confirm New Password" type={showPassword ? 'text' : 'password'}
                variant="outlined" size="small" sx={{ mb: 3 }}
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                InputProps={{ startAdornment: (
                  <InputAdornment position="start"><Lock sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment>
                ) }}
              />

              <Button type="submit" fullWidth variant="contained" disabled={submitting}
                sx={{
                  py: 1.4, backgroundColor: '#6366f1', fontWeight: 700, fontSize: '1rem',
                  textTransform: 'none', borderRadius: 2,
                  '&:hover': { backgroundColor: '#4f46e5' }
                }}>
                {submitting ? 'Please wait...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;
