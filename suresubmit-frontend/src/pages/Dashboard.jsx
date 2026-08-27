import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, Divider } from '@mui/material';
import { Rule, DataObject, Send, OpenInNew, TableChart } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const Dashboard = () => {
    const { user } = useAuth();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionCounts, setSubmissionCounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography sx={{ color: '#64748b' }}>Loading your forms...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, maxWidth: 1200, mx: 'auto', px: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
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
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 3 }}>
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
                        <Chip label={form.status} size="small" sx={{
                          backgroundColor: form.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                          color: form.status === 'ACTIVE' ? '#166534' : '#475569',
                          fontWeight: 600
                        }} />
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
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

                      <Box sx={{ display: 'flex', gap: 1 }}>
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
        </Box>
    );
};

export default Dashboard;