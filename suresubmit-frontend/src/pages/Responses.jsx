import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, LinearProgress, Alert, Button, Divider, Menu, MenuItem, IconButton
} from '@mui/material';
import { Rule, Send, DataObject, TableChart, Download, MoreVert } from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const Responses = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/forms/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/api/submissions/form/${id}`).then(r => r.json()),
    ])
      .then(([formData, subs]) => {
        setForm(formData);
        setSubmissions(subs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load responses');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2 }} />
        <Typography sx={{ mt: 2, color: '#64748b' }}>Loading responses...</Typography>
      </Box>
    );
  }

  if (!form) {
    return <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>Form not found</Alert>;
  }

  const fieldLabels = (form.fields || []).map(f => f.label);
  const activeRules = (form.crossFieldRules || []).filter(r => r.isApproved);

  const parsedRows = submissions.map((s) => {
    let data = {};
    try { data = JSON.parse(s.payloadJson || '{}'); } catch (e) {}
    return data;
  });

  const renderCellValue = (val) => {
    if (Array.isArray(val)) return val.join(', ');
    if (val === null || val === undefined || val === '') return <span style={{ color: '#cbd5e1' }}>—</span>;
    return String(val);
  };

  const csvEscape = (val) => {
    let s;
    if (Array.isArray(val)) s = val.join('; ');
    else if (val === null || val === undefined) s = '';
    else s = String(val);
    // wrap in quotes and escape embedded quotes to keep CSV valid
    return '"' + s.replace(/"/g, '""') + '"';
  };

  const toPlainText = (val) => {
    if (Array.isArray(val)) return val.join('; ');
    if (val === null || val === undefined) return '';
    return String(val);
  };

  const buildCsv = () => {
    const header = ['Submitted At', ...fieldLabels].map(csvEscape).join(',');
    const rows = parsedRows.map((row, rowIdx) => {
      const submitted = submissions[rowIdx]?.submittedAt
        ? new Date(submissions[rowIdx].submittedAt).toISOString()
        : '';
      const cells = fieldLabels.map((label) => csvEscape(toPlainText(row[label])));
      return [csvEscape(submitted), ...cells].join(',');
    });
    return [header, ...rows].join('\n');
  };

  const downloadFile = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const safeFilename = () => {
    const base = (form.title || `form_${id}`).replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '_');
    return base || `form_${id}`;
  };

  const exportCsv = () => {
    downloadFile(buildCsv(), `${safeFilename()}_responses.csv`, 'text/csv;charset=utf-8;');
    setExportMenuAnchor(null);
  };

  const exportJson = () => {
    const data = parsedRows.map((row, rowIdx) => ({
      submittedAt: submissions[rowIdx]?.submittedAt || null,
      ...row,
    }));
    downloadFile(JSON.stringify(data, null, 2), `${safeFilename()}_responses.json`, 'application/json;charset=utf-8;');
    setExportMenuAnchor(null);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 4, px: { xs: 0.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {form.title || `Form #${form.id}`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip icon={<Send />} label={`${submissions.length} responses`} size="small"
              sx={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
            <Chip icon={<Rule />} label={`${activeRules.length} active rules`} size="small"
              sx={{ backgroundColor: '#ede9fe', color: '#5b21b6', fontWeight: 600 }} />
            <Chip icon={<DataObject />} label={`${fieldLabels.length} fields`} size="small"
              sx={{ backgroundColor: '#e0f2fe', color: '#075985', fontWeight: 600 }} />
          </Box>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}>
          {submissions.length > 0 && (
            <Button variant="contained" startIcon={<Download />} onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{ backgroundColor: '#10b981', textTransform: 'none', fontWeight: 700, '&:hover': { backgroundColor: '#059669' } }}>
              Export
            </Button>
          )}
          <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
            <MenuItem onClick={exportCsv}>
              <Download sx={{ mr: 1, fontSize: 18 }} /> Download as CSV (Excel)
            </MenuItem>
            <MenuItem onClick={exportJson}>
              <DataObject sx={{ mr: 1, fontSize: 18 }} /> Download as JSON
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {submissions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <TableChart sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#475569', mb: 1 }}>
            No responses yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Share the form link to start collecting responses. They will appear here as a table.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflowX: 'auto', minWidth: 0 }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 800, color: '#64748b', minWidth: 120 }}>Submitted At</TableCell>
                {fieldLabels.map((label, i) => (
                  <TableCell key={i} sx={{ fontWeight: 800, color: '#64748b' }}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedRows.map((row, rowIdx) => (
                <TableRow key={rowIdx} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                  <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {submissions[rowIdx]?.submittedAt ? new Date(submissions[rowIdx].submittedAt).toLocaleString() : '—'}
                  </TableCell>
                  {fieldLabels.map((label, colIdx) => (
                    <TableCell key={colIdx} sx={{ color: '#334155' }}>
                      {renderCellValue(row[label])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ my: 4 }} />
      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
        All responses stored in your organization's own MySQL database — enterprise data sovereignty guaranteed.
      </Typography>
    </Box>
  );
};

export default Responses;