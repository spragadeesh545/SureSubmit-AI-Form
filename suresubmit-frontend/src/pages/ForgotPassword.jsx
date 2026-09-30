import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert,
  InputAdornment, IconButton
} from '@mui/material';
import { Email, SmartToy, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Could not process your request. Please try again.');
      }

      setSent(true);
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

        {sent ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Check your inbox
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              If an account exists for <strong>{email}</strong>, we sent a link to reset your password.
              The link expires in 60 minutes.
            </Typography>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Nothing arrived? Check your spam folder, then try again.
            </Alert>
            <Button fullWidth variant="outlined" onClick={() => navigate('/login')}
              sx={{ py: 1.2, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
              Back to Sign In
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth label="Email" type="email" variant="outlined" size="small" sx={{ mb: 3 }}
                value={email} onChange={(e) => setEmail(e.target.value)} required
                InputProps={{ startAdornment: (
                  <InputAdornment position="start"><Email sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment>
                ) }}
              />

              <Button type="submit" fullWidth variant="contained" disabled={submitting}
                sx={{
                  py: 1.4, backgroundColor: '#6366f1', fontWeight: 700, fontSize: '1rem',
                  textTransform: 'none', borderRadius: 2,
                  '&:hover': { backgroundColor: '#4f46e5' }
                }}>
                {submitting ? 'Please wait...' : 'Send Reset Link'}
              </Button>
            </form>

            <Button
              startIcon={<ArrowBack />} onClick={() => navigate('/login')} fullWidth
              sx={{ mt: 2, textTransform: 'none', color: '#64748b', fontWeight: 600 }}
            >
              Back to Sign In
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
