import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Alert } from '@mui/material';
import { Rule, DataObject, Send, OpenInNew, TableChart, Delete, Close, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const Dashboard = () => {
    const { user } = useAuth();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionCounts, setSubmissionCounts] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const fetchForms = () => {
        const userId = user?.userId;
        const url = userId ? `${API_BASE}/api/forms?userId=${userId}` : `${API_BASE}/api/forms`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setForms(data);
                setLoading(false);

                data.forEach((form) => {
                    fetch(`${API_BASE}/api/submissions/form/${form.id}`)
                        .then((r) => r.json())
                        .then((subs) => {
                            setSubmissionCounts((prev) => ({ ...prev, [form.id]: subs.length }));
                        })
                        .catch(() => {});
                });
            })
            .catch((error) => {
                console.error("Error fetching forms:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const openDeleteDialog = (form) => {
        setDeleteTarget(form);
        setDeletePassword('');
        setShowDeletePassword(false);
        setDeleteError('');
    };

    const closeDeleteDialog = () => {
        setDeleteTarget(null);
        setDeletePassword('');
        setShowDeletePassword(false);
        setDeleteError('');
        setDeleting(false);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('suresubmit_token');
        if (!token) {
            setDeleteError('You are not logged in.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            const res = await fetch(`${API_BASE}/api/forms/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password: deletePassword }),
            });

            if (res.status === 401) {
                setDeleteError('Session expired. Please log in again.');
            } else if (res.status === 403) {
                setDeleteError('Incorrect password. The form was not deleted.');
            } else if (res.status === 400) {
                let msg = 'The request was invalid. Please try again.';
                try {
                    const body = await res.json();
                    if (body && body.message) msg = body.message;
                } catch (parseErr) { /* ignore */ }
                setDeleteError(msg);
            } else if (res.ok) {
                setSubmissionCounts((prev) => {
                    const next = { ...prev };
                    delete next[deleteTarget.id];
                    return next;
                });
                setForms((prev) => prev.filter((f) => f.id !== deleteTarget.id));
                closeDeleteDialog();
            } else if (res.status === 405) {
                setDeleteError('The delete feature is not available on the server yet. The backend may need a redeploy.');
            } else {
                setDeleteError(`Request failed (status ${res.status}). Please try again.`);
            }
        } catch (err) {
            console.error("Delete error:", err);
            if (err && err.name === 'TypeError') {
                setDeleteError('Server unreachable or CORS blocked. Check that the backend is deployed and reachable.');
            } else {
                setDeleteError('Network error. Please try again.');
            }
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography sx={{ color: '#64748b' }}>Loading your forms...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, maxWidth: 1200, mx: 'auto', px: { xs: 0.5, sm: 2 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              My Form Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
              Manage your forms, view submissions, and track validation rules.
            </Typography>

            {forms.length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ color: '#64748b', mb: 2 }}>No forms yet</Typography>
                <Button variant="contained" onClick={() => navigate('/build')}
                  sx={{ backgroundColor: '#6366f1', textTransform: 'none', fontWeight: 600 }}>
                  Create Your First Form
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 2.5 }}>
                {forms.map((form) => {
                  const fieldCount = form.fields ? form.fields.length : 0;
                  const ruleCount = form.crossFieldRules ? form.crossFieldRules.length : 0;
                  const approvedRules = form.crossFieldRules ? form.crossFieldRules.filter(r => r.isApproved).length : 0;
                  const subCount = submissionCounts[form.id] || 0;

                  return (
                    <Paper key={form.id} elevation={0} sx={{
                      p: 4, border: '1px solid #e2e8f0', borderRadius: 3,
                      transition: 'all 0.2s', '&:hover': { borderColor: '#6366f1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)' }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', flex: 1 }}>
                          {form.title || `Untitled Form #${form.id}`}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip label={form.status} size="small" sx={{
                            backgroundColor: form.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                            color: form.status === 'ACTIVE' ? '#166534' : '#475569',
                            fontWeight: 600
                          }} />
                          <IconButton size="small" onClick={() => openDeleteDialog(form)} aria-label="Delete form"
                            sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}>
                            <Delete sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DataObject sx={{ fontSize: 18, color: '#6366f1' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                            {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rule sx={{ fontSize: 18, color: '#f59e0b' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                            {approvedRules}/{ruleCount} rules
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Send sx={{ fontSize: 18, color: '#10b981' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                            {subCount} submission{subCount !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>

                      {form.fields && form.fields.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Fields
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {form.fields.map((field, i) => (
                              <Chip key={i} label={field.label || field} size="small" variant="outlined"
                                sx={{ fontSize: '0.75rem', height: 24 }} />
                            ))}
                          </Box>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button fullWidth variant="contained" endIcon={<OpenInNew />}
                          onClick={() => navigate(`/form/${form.id}`)}
                          sx={{ py: 1, textTransform: 'none', fontWeight: 600, backgroundColor: '#0f172a',
                            '&:hover': { backgroundColor: '#1e293b' } }}>
                          Open Live Form
                        </Button>
                        <Button fullWidth variant="outlined" endIcon={<TableChart />}
                          onClick={() => navigate(`/responses/${form.id}`)}
                          sx={{ py: 1, textTransform: 'none', fontWeight: 600, color: '#6366f1', borderColor: '#c4b5fd',
                            '&:hover': { borderColor: '#6366f1', backgroundColor: '#f5f3ff' } }}>
                          Responses ({subCount})
                        </Button>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog open={Boolean(deleteTarget)} onClose={closeDeleteDialog} maxWidth="xs" fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, color: '#b91c1c' }}>
                  <Delete sx={{ color: '#ef4444' }} />
                  Delete Form
                </Box>
                <IconButton onClick={closeDeleteDialog} size="small" aria-label="Close">
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                  You are about to permanently delete <strong>"{deleteTarget?.title || `Form #${deleteTarget?.id}`}"</strong>.
                  This will also delete its {deleteTarget ? (submissionCounts[deleteTarget.id] || 0) : 0} submission(s) and cannot be undone.
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                  Enter your account password to confirm. A wrong password will cancel the deletion.
                </Typography>
                <TextField
                  type={showDeletePassword ? 'text' : 'password'} fullWidth size="small"
                  label="Account Password" value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !deleting) confirmDelete(); }}
                  disabled={deleting}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowDeletePassword((prev) => !prev)}
                        edge="end" size="small"
                        aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                      >
                        {showDeletePassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  }}
                />
                {deleteError && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setDeleteError('')}>
                    {deleteError}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <Button onClick={closeDeleteDialog} disabled={deleting} startIcon={<Lock />}
                  sx={{ textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
                  Cancel
                </Button>
                <Button variant="contained" color="error" onClick={confirmDelete} disabled={deleting || !deletePassword}
                  sx={{ textTransform: 'none', fontWeight: 700, width: { xs: '100%', sm: 'auto' } }}>
                  {deleting ? 'Deleting...' : 'Delete Form'}
                </Button>
              </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;