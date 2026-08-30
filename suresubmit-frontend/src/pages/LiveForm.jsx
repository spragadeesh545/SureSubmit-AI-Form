import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Button, Typography, TextField, MenuItem, Paper, Alert, Chip,
  LinearProgress, Divider, Checkbox, FormControlLabel, Radio,
  RadioGroup, FormControl, InputLabel, Select, OutlinedInput, Input,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody,
  TableCell, TableContainer, TableRow
} from '@mui/material';
import { Send, CheckCircle, Rule, AttachFile, DeleteOutline, Close } from '@mui/icons-material';
import { isPastEventDateField, todayISO } from '../utils/dateFields';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const OPERATORS = {
  greater_than: (a, b) => Number(a) > Number(b),
  less_than: (a, b) => Number(a) < Number(b),
  gte: (a, b) => Number(a) >= Number(b),
  lte: (a, b) => Number(a) <= Number(b),
  equals: (a, b) => String(a).trim() === String(b).trim(),
  not_equals: (a, b) => String(a).trim() !== String(b).trim(),
  date_after: (a, b) => new Date(a) > new Date(b),
  date_before: (a, b) => new Date(a) < new Date(b),
  count_equals: (a, b) => Number(a) === (Array.isArray(b) ? b.length : Number(b)),
  count_gte: (a, b) => Number(a) >= (Array.isArray(b) ? b.length : Number(b)),
  count_lte: (a, b) => Number(a) <= (Array.isArray(b) ? b.length : Number(b)),
  is_before_year: (a, b) => new Date(a).getFullYear() < Number(b),
  date_not_future: (a) => new Date(a) <= new Date(),
};

const OPERATOR_LABELS = {
  greater_than: '>',
  less_than: '<',
  gte: '>=',
  lte: '<=',
  equals: '==',
  not_equals: '!=',
  date_after: 'after',
  date_before: 'before',
  count_equals: 'count ==',
  count_gte: 'count >=',
  count_lte: 'count <=',
  is_before_year: 'year before',
  date_not_future: 'not in the future',
};

function validateCrossFieldRules(values, rules) {
  const errors = {};

  for (const rule of rules) {
    if (!rule.isApproved) continue;

    const primaryLabel = rule.primaryField?.label;
    const secondaryLabel = rule.secondaryField?.label;

    const primaryValue = values[primaryLabel];
    const secondaryValue = secondaryLabel ? values[secondaryLabel] : null;
    const compareValue = secondaryValue !== null ? secondaryValue : rule.staticValue;

    if (primaryValue === undefined || primaryValue === null || primaryValue === '') {
      continue;
    }

    if (rule.operator === 'date_not_future') {
      const evaluator = OPERATORS.date_not_future;
      if (!evaluator(primaryValue)) {
        errors[primaryLabel] = rule.errorMessage || `${primaryLabel} cannot be a future date.`;
      }
      continue;
    }

    if (compareValue === null || compareValue === undefined || compareValue === '') {
      continue;
    }

    const evaluator = OPERATORS[rule.operator];
    if (!evaluator) continue;

    const isValid = evaluator(primaryValue, compareValue);

    if (!isValid) {
      if (rule.operator.startsWith('count_') && Array.isArray(compareValue)) {
        const expectedCount = Number(primaryValue);
        const actualCount = compareValue.length;
        errors[primaryLabel] = `${primaryLabel} requires ${expectedCount} member${expectedCount === 1 ? '' : 's'}, but ${secondaryLabel} contains ${actualCount}.`;
      } else {
        errors[primaryLabel] = rule.errorMessage;
      }
    }
  }

  return errors;
}

function renderField(field, value, onChange, error, fieldRules) {
  const commonProps = {
    error: !!error,
    helperText: error,
    required: field.isRequired,
  };

  switch (field.inputType) {
    case 'textarea':
      return (
        <TextField
          fullWidth multiline minRows={3} size="small"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          {...commonProps}
        />
      );

    case 'dropdown':
      return (
        <TextField
          select fullWidth size="small"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          {...commonProps}
        >
          <MenuItem value="">Select an option</MenuItem>
          {(field.options || []).map((opt, i) => (
            <MenuItem key={i} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      );

    case 'radio':
      return (
        <FormControl error={!!error} required={field.isRequired}>
          <RadioGroup value={value || ''} onChange={(e) => onChange(field.label, e.target.value)}>
            {(field.options || []).map((opt, i) => (
              <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
          {error && <Typography variant="caption" sx={{ color: '#f44336' }}>{error}</Typography>}
        </FormControl>
      );

    case 'checkbox': {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (opt) => {
        const next = selected.includes(opt)
          ? selected.filter((x) => x !== opt)
          : [...selected, opt];
        onChange(field.label, next);
      };
      return (
        <Box>
          {(field.options || []).map((opt, i) => (
            <FormControlLabel
              key={i}
              control={<Checkbox checked={selected.includes(opt)} onChange={() => toggle(opt)} />}
              label={opt}
            />
          ))}
          {error && <Typography variant="caption" sx={{ color: '#f44336' }}>{error}</Typography>}
        </Box>
      );
    }

    case 'file': {
      const fileName = value ? (typeof value === 'string' ? value : value.name) : '';
      return (
        <Box>
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) onChange(field.label, file.name);
            }}
            sx={{ display: 'none' }}
            id={`file-${field.label}`}
          />
          <label htmlFor={`file-${field.label}`}>
            <Button component="span" variant="outlined" startIcon={<AttachFile />}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#6366f1', borderColor: '#c4b5fd' }}>
              Upload File
            </Button>
          </label>
          {fileName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#166534' }}>{fileName}</Typography>
              <Button size="small" onClick={() => onChange(field.label, '')} sx={{ color: '#ef4444' }}>
                <DeleteOutline fontSize="small" /> Remove
              </Button>
            </Box>
          )}
          {error && <Typography variant="caption" sx={{ color: '#f44336' }}>{error}</Typography>}
        </Box>
      );
    }

    case 'number':
      return (
        <TextField
          fullWidth size="small" type="number"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          {...commonProps}
        />
      );

    case 'date': {
      const hasNoFutureRule = (fieldRules || []).some(r => r.operator === 'date_not_future' && r.isApproved);
      const allowFuture = !hasNoFutureRule && !isPastEventDateField(field.label);
      return (
        <TextField
          fullWidth size="small" type="date"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: allowFuture ? undefined : todayISO() }}
          {...commonProps}
        />
      );
    }

    case 'email':
      return (
        <TextField
          fullWidth size="small" type="email"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          {...commonProps}
        />
      );

    case 'telephone':
      return (
        <TextField
          fullWidth size="small" type="tel"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          {...commonProps}
        />
      );

    case 'url':
      return (
        <TextField
          fullWidth size="small" type="url"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`https://...`}
          {...commonProps}
        />
      );

    case 'password':
      return (
        <TextField
          fullWidth size="small" type="password"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          {...commonProps}
        />
      );

    case 'text':
    default:
      return (
        <TextField
          fullWidth size="small" type="text"
          value={value || ''}
          onChange={(e) => onChange(field.label, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          {...commonProps}
        />
      );
  }
}

const hasDraftKey = (formId) => `suresubmit_draft_${formId}`;

const isValuesEmpty = (v) => {
  if (!v) return true;
  return Object.values(v).every((val) =>
    Array.isArray(val) ? val.length === 0 : val === '' || val === null || val === undefined
  );
};

const LiveForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);
  const saveTimer = useRef(null);

  const persistDraft = (formId, vals) => {
    try {
      if (isValuesEmpty(vals)) {
        localStorage.removeItem(hasDraftKey(formId));
      } else {
        localStorage.setItem(hasDraftKey(formId), JSON.stringify(vals));
      }
    } catch (e) {
      console.error("Failed to save draft:", e);
    }
  };

  const clearDraft = (formId) => {
    try {
      localStorage.removeItem(hasDraftKey(formId));
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/forms/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Form not found');
        return res.json();
      })
      .then((data) => {
        setForm(data);
        const initial = {};
        if (data.fields) {
          data.fields.forEach((f) => {
            initial[f.label] = f.inputType === 'checkbox' ? [] : '';
          });
        }
        setValues(initial);
        setLoading(false);

        let existing = null;
        try {
          const raw = localStorage.getItem(hasDraftKey(data.id));
          if (raw) existing = JSON.parse(raw);
        } catch (e) { /* ignore */ }

        if (existing && !isValuesEmpty(existing)) {
          setDraftAvailable(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching form:", err);
        setLoading(false);
      });
  }, [id]);

  const runValidation = useCallback(() => {
    if (!form || !form.crossFieldRules) return {};
    return validateCrossFieldRules(values, form.crossFieldRules);
  }, [values, form]);

  const handleChange = (label, value) => {
    const newValues = { ...values, [label]: value };
    setValues(newValues);

    if (form && form.crossFieldRules) {
      const newErrors = validateCrossFieldRules(newValues, form.crossFieldRules);
      setErrors(newErrors);
    }

    if (form) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persistDraft(form.id, newValues), 500);
    }
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(hasDraftKey(form.id));
      if (raw) {
        const saved = JSON.parse(raw);
        setValues(saved);
        if (form.crossFieldRules) {
          setErrors(validateCrossFieldRules(saved, form.crossFieldRules));
        }
      }
    } catch (e) {
      console.error("Failed to restore draft:", e);
    }
    setDraftAvailable(false);
  };

  const discardDraft = () => {
    clearDraft(form.id);
    setDraftAvailable(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = runValidation();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Please fix the validation errors below before submitting.');
      return;
    }

    for (const field of (form.fields || [])) {
      const v = values[field.label];
      const isEmpty = field.inputType === 'checkbox' ? !Array.isArray(v) || v.length === 0 : !v || String(v).trim() === '';
      if (field.isRequired && isEmpty) {
        setErrors((prev) => ({ ...prev, [field.label]: `${field.label} is required.` }));
        setSubmitError('Please fill in all required fields.');
        return;
      }
    }

    setReviewOpen(true);
  };

  const confirmSubmit = async () => {
    setSubmitting(true);

    try {
      const submissionPayload = {
        formId: form.id,
        payloadJson: JSON.stringify(values),
      };

      const response = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        throw new Error('Submission failed. Please try again.');
      }

      if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
      clearDraft(form.id);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto', borderRadius: 2 }} />
        <Typography sx={{ mt: 2, color: '#64748b' }}>Loading form...</Typography>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 700 }}>Form not found</Typography>
        <Typography sx={{ color: '#64748b', mt: 1 }}>This form may have been removed or the link is incorrect.</Typography>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 6, px: { xs: 1, sm: 2 } }}>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 6 }, textAlign: 'center', border: '2px solid #10b981',
          borderRadius: 3, backgroundColor: '#f0fdf4'
        }}>
          <CheckCircle sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534', mb: 1 }}>
            Response Submitted!
          </Typography>
          <Typography variant="body1" sx={{ color: '#15803d', mb: 4 }}>
            {form.confirmationMessage || 'Your data has been securely stored. Thank you for your submission.'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Data sovereignty: your response was stored directly in the organization's database, not in a third-party cloud.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const fieldLabels = new Set((form.fields || []).map(field => field.label));
  const activeRules = (form.crossFieldRules || []).filter(r =>
    r.isApproved &&
    fieldLabels.has(r.primaryField?.label) &&
    (!r.secondaryField || fieldLabels.has(r.secondaryField.label))
  );
  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', py: 4, px: { xs: 1, sm: 2 } }}>

      {/* FORM HEADER */}
      <Paper elevation={0} sx={{
        p: { xs: 2.5, sm: 4 }, mb: 4, border: '1px solid #e2e8f0',
        borderTop: `8px solid ${form.themeColor || '#6366f1'}`, borderRadius: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {form.title || `Form #${form.id}`}
        </Typography>
        {form.description && (
          <Typography variant="body1" sx={{ color: '#64748b', mb: 1 }}>
            {form.description}
          </Typography>
        )}
        {activeRules.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Rule sx={{ color: form.themeColor || '#6366f1', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: form.themeColor || '#6366f1', fontWeight: 600 }}>
              {activeRules.length} cross-field validation rule{activeRules.length !== 1 ? 's' : ''} active
            </Typography>
          </Box>
        )}
      </Paper>

      {/* DRAFT RESTORE BANNER */}
      {draftAvailable && form && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" color="primary" variant="contained"
                onClick={restoreDraft} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Restore
              </Button>
              <Button size="small" color="inherit"
                onClick={discardDraft} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Discard
              </Button>
            </Box>
          }
        >
          <Typography variant="body2">
            <strong>You have a saved draft</strong> from your previous visit. Would you like to continue where you left off?
          </Typography>
        </Alert>
      )}

      {/* SUBMIT ERROR */}
      {submitError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {submitError}
        </Alert>
      )}

      {/* FORM FIELDS */}
      <form onSubmit={handleSubmit}>
        {(form.fields || []).map((field, index) => {
          const fieldError = errors[field.label];
          const fieldRules = activeRules.filter(r => r.primaryField?.label === field.label);

          return (
            <Paper key={index} elevation={0} sx={{
              p: 3, mb: 3, border: fieldError ? '2px solid #ef4444' : '1px solid #e2e8f0',
              borderRadius: 2, transition: 'border-color 0.2s',
              backgroundColor: fieldError ? '#fef2f2' : '#ffffff'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#334155' }}>
                  {field.label}
                </Typography>
                {field.isRequired && (
                  <Typography sx={{ color: '#ef4444', fontWeight: 700 }}>*</Typography>
                )}
              </Box>

              {renderField(field, values[field.label], handleChange, fieldError, fieldRules)}

              {/* Show which rules affect this field */}
              {fieldRules.map((rule, ri) => (
                <Chip
                  key={ri} size="small"
                  label={`Rule: ${rule.description || `${rule.primaryField?.label} ${OPERATOR_LABELS[rule.operator] || rule.operator} ${rule.secondaryField?.label || rule.staticValue}`}`}
                  sx={{
                    mt: 1, fontSize: '0.7rem',
                    backgroundColor: errors[field.label] ? '#fee2e2' : '#f1f5f9',
                    color: errors[field.label] ? '#991b1b' : '#475569',
                  }}
                />
              ))}
            </Paper>
          );
        })}

        {/* VALIDATION SUMMARY */}
        {hasValidationErrors && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Cross-Field Validation Failed
            </Typography>
            {Object.entries(errors).map(([field, msg]) => (
              <Typography key={field} variant="body2">
                <strong>{field}:</strong> {msg}
              </Typography>
            ))}
          </Alert>
        )}

        {/* SUBMIT BUTTON */}
        <Button
          type="submit" variant="contained" fullWidth size="large" disabled={submitting}
          startIcon={submitting ? <LinearProgress /> : <Send />}
          sx={{
            mt: 2, py: 1.5, backgroundColor: '#10b981',
            fontWeight: 700, fontSize: '1.1rem', textTransform: 'none',
            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)',
            '&:hover': { backgroundColor: '#059669', boxShadow: '0 6px 8px rgba(16, 185, 129, 0.4)' },
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Response'}
        </Button>
      </form>

      {/* REVIEW & CONFIRM DIALOG */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <CheckCircle sx={{ color: '#10b981' }} />
            Review Your Answers
          </Box>
          <IconButton onClick={() => setReviewOpen(false)} size="small" aria-label="Close">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Please verify your information before submitting. If anything is wrong, close this box to edit your answers.
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <Table size="small">
              <TableBody>
                {(form.fields || []).map((field, index) => {
                  const val = values[field.label];
                  const display = field.inputType === 'checkbox'
                    ? (Array.isArray(val) && val.length > 0 ? val.join(', ') : '—')
                    : (!val || String(val).trim() === '' ? '—' : String(val));
                  return (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 700, color: '#334155', width: '40%', verticalAlign: 'top' }}>
                        {field.label}
                        {field.isRequired && <span style={{ color: '#ef4444' }}> *</span>}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{display}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {submitError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{submitError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button onClick={() => setReviewOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>
            ← Edit Answers
          </Button>
          <Button variant="contained" onClick={confirmSubmit} disabled={submitting} startIcon={submitting ? <LinearProgress /> : <Send />}
            sx={{
              textTransform: 'none', fontWeight: 700, backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' }, width: { xs: '100%', sm: 'auto' }
            }}>
            {submitting ? 'Submitting...' : 'Confirm & Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DATA SOVEREIGNTY FOOTER */}
      <Paper elevation={0} sx={{
        mt: 4, p: 3, border: '1px solid #e2e8f0', borderRadius: 2,
        backgroundColor: '#f8fafc', textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          Powered by SureSubmit | Your data is stored securely with enterprise data sovereignty
        </Typography>
      </Paper>
    </Box>
  );
};

export default LiveForm;