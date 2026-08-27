import { useState } from 'react';
import {
  Box, Button, Typography, TextField, MenuItem, Paper, IconButton,
  LinearProgress, Chip, Tooltip, Divider, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Radio, RadioGroup, FormControlLabel,
  FormControl, Snackbar, Tab, Tabs, Checkbox
} from '@mui/material';
import {
  DeleteOutline, Add, AutoAwesome, Visibility, Undo, Redo,
  ContentCopy, CheckCircle, Cancel, Rule, SmartToy, Send,
  Palette, Settings, Share, Link as LinkIcon, Email, Code,
  Edit, PersonAdd, ContentCut, Close, ColorLens, ConfirmationNumber
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Answer' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'telephone', label: 'Phone Number' },
  { value: 'url', label: 'Website / URL' },
  { value: 'password', label: 'Password' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
];

const OPERATORS = [
  { value: 'greater_than', label: 'Must be greater than' },
  { value: 'less_than', label: 'Must be less than' },
  { value: 'gte', label: 'Must be >= to' },
  { value: 'lte', label: 'Must be <= to' },
  { value: 'equals', label: 'Must equal' },
  { value: 'not_equals', label: 'Must not equal' },
  { value: 'date_after', label: 'Must be after' },
  { value: 'date_before', label: 'Must be before' },
  { value: 'count_equals', label: 'Number of selections must equal' },
  { value: 'count_gte', label: 'Number of selections must be >= to' },
  { value: 'count_lte', label: 'Number of selections must be <= to' },
  { value: 'is_before_year', label: 'Must be before year' },
];

function OptionsEditor({ field, onUpdate }) {
  const [optionText, setOptionText] = useState('');

  const addOption = () => {
    if (!optionText.trim()) return;
    const options = [...(field.options || []), optionText.trim()];
    onUpdate(field.id, 'options', options);
    setOptionText('');
  };

  const removeOption = (idx) => {
    const options = (field.options || []).filter((_, i) => i !== idx);
    onUpdate(field.id, 'options', options);
  };

  return (
    <Box sx={{ pl: 5 }}>
      {(field.options || []).map((opt, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>{i + 1}.</Typography>
          <TextField size="small" variant="outlined" fullWidth value={opt} sx={{ maxWidth: 300 }}
            onChange={(e) => {
              const options = [...(field.options || [])];
              options[i] = e.target.value;
              onUpdate(field.id, 'options', options);
            }} />
          <IconButton size="small" onClick={() => removeOption(i)} sx={{ color: '#ef4444' }}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
        <TextField size="small" variant="outlined" fullWidth placeholder="Add option"
          value={optionText} onChange={(e) => setOptionText(e.target.value)} sx={{ maxWidth: 300 }} />
        <Button size="small" onClick={addOption} startIcon={<Add />}
          sx={{ textTransform: 'none', color: '#6366f1', fontWeight: 600 }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}

function FieldCard({ field, index, onUpdate, onRemove }) {
  return (
    <Paper elevation={0} sx={{
      p: 3, mb: 2, border: '1px solid #e2e8f0',
      display: 'flex', gap: 3, alignItems: 'flex-start', borderRadius: 2,
      transition: 'border-color 0.2s',
      '&:hover': { borderColor: '#94a3b8' }
    }}>
      <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 700, pt: 1 }}>
        {index + 1}.
      </Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth label="Field Label" variant="outlined" size="small"
            value={field.label}
            onChange={(e) => onUpdate(field.id, 'label', e.target.value)}
          />
          <TextField
            select label="Input Type" size="small" value={field.inputType}
            onChange={(e) => onUpdate(field.id, 'inputType', e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {FIELD_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
          <Chip
            label={field.isRequired ? 'Required' : 'Optional'}
            color={field.isRequired ? 'error' : 'default'}
            onClick={() => onUpdate(field.id, 'isRequired', !field.isRequired)}
            variant={field.isRequired ? 'filled' : 'outlined'}
            sx={{ cursor: 'pointer', fontWeight: 600 }}
          />
        </Box>

        {['dropdown', 'radio', 'checkbox'].includes(field.inputType) && (
          <OptionsEditor field={field} onUpdate={onUpdate} />
        )}
      </Box>
      <IconButton color="error" onClick={() => onRemove(field.id)} sx={{ mt: 0.5 }}>
        <DeleteOutline />
      </IconButton>
    </Paper>
  );
}

function RuleCard({ rule, index, onApprove, onReject }) {
  const primaryLabel = rule.primaryFieldLabel;
  const secondaryLabel = rule.secondaryFieldLabel;
  const operatorLabel = OPERATORS.find(o => o.value === rule.operator)?.label || rule.operator;

  return (
    <Paper elevation={0} sx={{
      p: 3, mb: 2, borderRadius: 2,
      border: rule.isApproved ? '2px solid #10b981' : '1px solid #e2e8f0',
      backgroundColor: rule.isApproved ? '#f0fdf4' : '#ffffff',
      transition: 'all 0.3s ease',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rule sx={{ color: '#6366f1', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rule #{index + 1}
            </Typography>
            {rule.isApproved && (
              <Chip icon={<CheckCircle />} label="Approved" size="small"
                sx={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
            )}
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
            "{primaryLabel}" {operatorLabel}{" "}
            {secondaryLabel ? `"${secondaryLabel}"` : rule.staticValue}
          </Typography>
          {rule.description && (
            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
              {rule.description}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mt: 1 }}>
            Error: {rule.errorMessage}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
          <Tooltip title="Approve Rule">
            <IconButton onClick={() => onApprove(rule.id)} sx={{
              color: '#10b981', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
              '&:hover': { backgroundColor: '#dcfce7' }
            }}>
              <CheckCircle />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject & Delete">
            <IconButton onClick={() => onReject(rule.id)} sx={{
              color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              '&:hover': { backgroundColor: '#fee2e2' }
            }}>
              <Cancel />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
}

function ShareDialog({ open, onClose, shareableLink, formTitle }) {
  const [shareTab, setShareTab] = useState(0);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${shareableLink}" width="100%" height="800" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <Share sx={{ color: '#6366f1' }} />
        Share "{formTitle}"
      </DialogTitle>
      <DialogContent>
        <Tabs value={shareTab} onChange={(_, v) => setShareTab(v)} sx={{ mb: 3 }}>
          <Tab icon={<LinkIcon />} iconPosition="start" label="Link" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<Email />} iconPosition="start" label="Email" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<Code />} iconPosition="start" label="Embed" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        {shareTab === 0 && (
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Anyone with this link can view and fill out this form.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField fullWidth size="small" value={shareableLink} InputProps={{ readOnly: true }}
                sx={{ backgroundColor: '#f8fafc' }} />
              <Button variant="contained" onClick={handleCopyLink} startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                sx={{ minWidth: 100, textTransform: 'none', fontWeight: 600,
                  backgroundColor: copied ? '#10b981' : '#6366f1' }}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Box>
        )}

        {shareTab === 1 && (
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Send the form link via email directly.
            </Typography>
            <TextField fullWidth size="small" placeholder="Enter email address"
              value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" startIcon={<Email />} disabled={!email}
              onClick={() => { window.open(`mailto:${email}?subject=${encodeURIComponent(formTitle)}&body=${encodeURIComponent(`Please fill out this form:\n\n${shareableLink}`)}`); }}
              sx={{ textTransform: 'none', fontWeight: 600, backgroundColor: '#6366f1' }}>
              Open Email Client
            </Button>
          </Box>
        )}

        {shareTab === 2 && (
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
              Embed this form in any website using an iframe.
            </Typography>
            <TextField fullWidth multiline rows={3} size="small" InputProps={{ readOnly: true }}
              value={`<iframe src="${shareableLink}" width="100%" height="800" frameborder="0"></iframe>`}
              sx={{ backgroundColor: '#f8fafc', fontFamily: 'monospace', mb: 2 }} />
            <Button variant="contained" onClick={handleCopyEmbed} startIcon={copied ? <CheckCircle /> : <ContentCopy />}
              sx={{ textTransform: 'none', fontWeight: 600, backgroundColor: copied ? '#10b981' : '#6366f1' }}>
              {copied ? 'Copied!' : 'Copy Embed Code'}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SettingsDialog({ open, onClose, formTitle, formDescription, confirmationMessage, accentColor,
  onTitleChange, onDescriptionChange, onConfirmationChange, onColorChange }) {
  const colors = ['#6366f1', '#0f172a', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <Settings sx={{ color: '#6366f1' }} />
        Form Settings
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField fullWidth label="Form Title" value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)} />
        <TextField fullWidth label="Form Description" value={formDescription} multiline minRows={2}
          onChange={(e) => onDescriptionChange(e.target.value)} />
        <TextField fullWidth label="Confirmation Message (shown after submit)"
          value={confirmationMessage}
          onChange={(e) => onConfirmationChange(e.target.value)} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mb: 1.5 }}>Theme Color</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {colors.map((c) => (
              <Box key={c} onClick={() => onColorChange(c)}
                sx={{
                  width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                  backgroundColor: c,
                  border: accentColor === c ? '3px solid #0f172a' : '3px solid transparent',
                  transition: 'transform 0.15s ease', '&:hover': { transform: 'scale(1.15)' }
                }} />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, backgroundColor: '#6366f1' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PreviewDialog({ open, onClose, formTitle, formDescription, fields, accentColor }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <Visibility sx={{ color: '#6366f1' }} />
          Form Preview
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: '#f8fafc' }}>
        <Paper elevation={0} sx={{
          p: 4, mb: 3, borderTop: `8px solid ${accentColor}`, borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{formTitle}</Typography>
          {formDescription && (
            <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>{formDescription}</Typography>
          )}
        </Paper>
        {fields.length === 0 && (
          <Typography sx={{ color: '#94a3b8', textAlign: 'center', py: 4 }}>
            Add at least one field to preview.
          </Typography>
        )}
        {fields.map((field, index) => (
          <Paper key={field.id} elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              {index + 1}. {field.label || 'Untitled field'}
              {field.isRequired && <span style={{ color: '#ef4444' }}> *</span>}
            </Typography>
            {field.inputType === 'textarea' ? (
              <TextField fullWidth multiline minRows={2} disabled size="small" placeholder="Paragraph text" />
            ) : field.inputType === 'dropdown' ? (
              <TextField select fullWidth size="small" disabled value="">
                <MenuItem value="">Select an option</MenuItem>
                {(field.options || []).map((o, i) => <MenuItem key={i} value={o}>{o}</MenuItem>)}
              </TextField>
            ) : field.inputType === 'radio' ? (
              <RadioGroup>
                {(field.options || []).map((o, i) => (
                  <FormControlLabel key={i} value={o} control={<Radio />} label={o} />
                ))}
              </RadioGroup>
            ) : field.inputType === 'checkbox' ? (
              <Box>
                {(field.options || []).map((o, i) => (
                  <FormControlLabel key={i} value={o} control={<Checkbox />} label={o} />
                ))}
              </Box>
            ) : (
              <TextField fullWidth disabled size="small"
                type={field.inputType === 'number' ? 'number' : field.inputType === 'date' ? 'date' : field.inputType === 'email' ? 'email' : 'text'}
                placeholder={field.inputType === 'password' ? 'Password' : field.inputType === 'file' ? 'No file chosen' : ''} />
            )}
          </Paper>
        ))}
      </DialogContent>
    </Dialog>
  );
}

function AccessControlDialog({ open, onClose }) {
  const [accessLevel, setAccessLevel] = useState('anyone');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
        <PersonAdd sx={{ color: '#6366f1' }} />
        Who has access
      </DialogTitle>
      <DialogContent>
        <FormControl>
          <RadioGroup value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
            <FormControlLabel value="anyone" control={<Radio />} label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Anyone with the link</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>No sign-in required</Typography>
              </Box>
            } sx={{ mb: 1, border: '1px solid #e2e8f0', borderRadius: 2, p: 1, mx: 0 }} />
            <FormControlLabel value="restricted" control={<Radio />} label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>Restricted</Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>Only specific people can access</Typography>
              </Box>
            } sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 1, mx: 0 }} />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FormBuilder() {
  const { user } = useAuth();
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [fields, setFields] = useState([]);
  const [rules, setRules] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedFormId, setPublishedFormId] = useState(null);
  const [approvalStep, setApprovalStep] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [formDescription, setFormDescription] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('Your response has been recorded.');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = (newFields, newRules = rules, newTitle = formTitle) => {
    const snapshot = { fields: newFields, rules: newRules, formTitle: newTitle };
    setHistory(h => [...h.slice(0, historyIndex + 1), snapshot]);
    setHistoryIndex(i => i + 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    const snap = history[idx];
    setFields(snap.fields);
    setRules(snap.rules);
    setFormTitle(snap.formTitle);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    const snap = history[idx];
    setFields(snap.fields);
    setRules(snap.rules);
    setFormTitle(snap.formTitle);
  };

  const getLiveLink = () => publishedFormId ? `${window.location.origin}/form/${publishedFormId}` : '';

  const callGroq = async (apiKey, messages) => {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message || `API Error: ${r.status}`);
    let raw = d.choices[0].message.content.trim();
    raw = raw.replace(/```json/g, "").replace(/```/g, "");
    return JSON.parse(raw);
  };

  const TYPE_FAMILY = {
    text: 'string', textarea: 'string', email: 'string', telephone: 'string',
    url: 'string', password: 'string', dropdown: 'choice', radio: 'choice',
    number: 'number', date: 'date', checkbox: 'multi', file: 'file',
  };
  const isNum = (v) => v !== null && v !== undefined && v !== '' && !isNaN(parseFloat(v));
  const isISODate = (v) => typeof v === 'string' && !isNaN(Date.parse(v));

  const validateRule = (rule, fieldLabels, fieldTypeMap) => {
    if (!rule.primaryFieldLabel || !fieldLabels.includes(rule.primaryFieldLabel)) return false;
    if (!rule.operator || !rule.errorMessage) return false;
    if (rule.secondaryFieldLabel && !fieldLabels.includes(rule.secondaryFieldLabel)) return false;
    if (rule.primaryFieldLabel === rule.secondaryFieldLabel) return false;

    const primaryType = fieldTypeMap[rule.primaryFieldLabel];
    const secondaryType = rule.secondaryFieldLabel ? fieldTypeMap[rule.secondaryFieldLabel] : null;
    const pFamily = TYPE_FAMILY[primaryType];
    const sFamily = secondaryType ? TYPE_FAMILY[secondaryType] : null;
    const sv = rule.staticValue;

    switch (rule.operator) {
      case 'greater_than':
      case 'less_than':
      case 'gte':
      case 'lte':
        if (secondaryType) return pFamily === 'number' && sFamily === 'number';
        return pFamily === 'number' && isNum(sv);

      case 'date_after':
      case 'date_before':
        if (secondaryType) return pFamily === 'date' && sFamily === 'date';
        return pFamily === 'date' && isISODate(sv);

      case 'is_before_year':
        return !secondaryType && pFamily === 'date' && /^\d{4}$/.test(String(sv || '').trim());

      case 'equals':
      case 'not_equals': {
        if (pFamily === 'file' || pFamily === 'multi') return false;
        if (secondaryType) {
          if (sFamily === 'file' || sFamily === 'multi') return false;
          return pFamily === sFamily;
        }
        return Boolean(sv);
      }

      case 'count_equals':
      case 'count_gte':
      case 'count_lte':
        return pFamily === 'number' && sFamily === 'multi';

      default:
        return false;
    }
  };

  const repairRule = (rule, fieldTypeMap) => {
    const r = { ...rule };
    const pType = fieldTypeMap[r.primaryFieldLabel];
    const sType = r.secondaryFieldLabel ? fieldTypeMap[r.secondaryFieldLabel] : null;
    if (['count_equals', 'count_gte', 'count_lte'].includes(r.operator)
        && TYPE_FAMILY[pType] === 'multi' && sType === 'number') {
      [r.primaryFieldLabel, r.secondaryFieldLabel] = [r.secondaryFieldLabel, r.primaryFieldLabel];
    }
    return r;
  };

  const normalizeLabel = (label, fieldLabels) => {
    if (fieldLabels.includes(label)) return label;
    const norm = (s) => s.toLowerCase().trim();
    const target = norm(label);
    return fieldLabels.find(f => norm(f) === target) || label;
  };

  const dedupeRules = (rules) => {
    const seen = new Set();
    return rules.filter(r => {
      const key = `${r.primaryFieldLabel}__${r.operator}__${r.secondaryFieldLabel || ''}__${r.staticValue || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const explicitEqualityRules = (request, fieldLabels, fieldTypeMap, rules) => {
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const requestText = request.toLowerCase();
    const equalityRules = [];

    fieldLabels.forEach((primaryLabel) => {
      fieldLabels.forEach((secondaryLabel) => {
        if (primaryLabel === secondaryLabel) return;

        const equalityPattern = new RegExp(
          `${escapeRegex(primaryLabel.toLowerCase())}[\\s\\S]{0,100}(?:must\\s+(?:be\\s+)?equal(?:\\s+to)?|equals?|same\\s+as)[\\s\\S]{0,100}${escapeRegex(secondaryLabel.toLowerCase())}`
        );
        if (!equalityPattern.test(requestText)) return;

        const primaryFamily = TYPE_FAMILY[fieldTypeMap[primaryLabel]];
        const secondaryFamily = TYPE_FAMILY[fieldTypeMap[secondaryLabel]];
        if (!primaryFamily || primaryFamily !== secondaryFamily || ['file', 'multi'].includes(primaryFamily)) return;

        const existingRule = rules.find(rule =>
          rule.primaryFieldLabel === primaryLabel && rule.secondaryFieldLabel === secondaryLabel
        );
        equalityRules.push({
          ...(existingRule || {}),
          primaryFieldLabel: primaryLabel,
          operator: 'equals',
          secondaryFieldLabel: secondaryLabel,
          staticValue: null,
          errorMessage: `"${primaryLabel}" must equal "${secondaryLabel}"`,
          description: `Ensures ${primaryLabel} matches ${secondaryLabel}`,
        });
      });
    });

    const explicitKeys = new Set(equalityRules.map(rule =>
      `${rule.primaryFieldLabel}__${rule.secondaryFieldLabel}`
    ));
    return [
      ...rules.filter(rule => !explicitKeys.has(`${rule.primaryFieldLabel}__${rule.secondaryFieldLabel}`)),
      ...equalityRules,
    ];
  };

  const handleAIGeneration = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("VITE_GROQ_API_KEY is missing from .env!");

      const FIELD_SYSTEM = `You are an expert form engineer. Return ONLY valid JSON. No markdown, no code blocks, no explanations.

Your job: design form fields. Choose the BEST inputType. Infer types intelligently from field names even when the user gives a short list.

VALID inputType: "text", "textarea", "number", "date", "email", "telephone", "url", "password", "dropdown", "radio", "checkbox", "file"

SMART TYPE INFERENCE (follow these mappings when the user gives field names without specifying types):
- "team member(s)", "member(s)", "participant(s)", "skill(s)", "feature(s)", "interest(s)", "preference(s)" → checkbox (with generated options like "Member 1", "Member 2" etc., or infer from context)
- "mark(s)", "score(s)", "points", "grade(number)", "age", "quantity", "amount", "total", "obtained", "capacity", "count", "size", "width", "height", "weight", "distance", "duration", "rating(1-10)" → number
- "date of birth", "dob", "birth date", "admission date", "start date", "end date", "deadline", "joining date" → date
- "email", "e-mail" → email
- "phone", "telephone", "mobile", "contact number" → telephone
- "website", "url", "link" → url
- "password", "confirm password", "new password" → password
- "address", "description", "bio", "notes", "comments", "feedback", "message" → textarea
- "name", "title", "subject", "city", "country" → text
- "photo", "image", "document", "file", "attachment", "resume", "cv" → file
- "gender", "status", "priority", "category", "type" → dropdown (with sensible options)
- "agree", "terms", "consent" → checkbox (single option)
- When unsure whether a field is numeric or text, prefer "number" if the name suggests a measurable quantity.

For dropdown/radio/checkbox fields, generate an "options" array with realistic options matching the context.

Return EXACTLY this JSON:
{
  "formTitle": "Professional title",
  "fields": [
    { "label": "Field Label", "inputType": "text", "isRequired": true, "options": ["Option 1", "Option 2"] }
  ]
}`;

      const RULE_SYSTEM = `You are a data validation architect. Return ONLY valid JSON. No markdown, no code blocks, no explanations.

You will receive a list of fields with their labels and inputTypes.
Your job: generate cross-field validation rules that are type-compatible and logically meaningful.

BE PROACTIVE — Do NOT wait for the user to ask for rules. Infer rules from the field types and names:
- If a number field and a checkbox field exist → ALWAYS suggest count_equals (team size ↔ team members pattern)
- If two number fields with a logical pair exist (total/obtained, min/max) → suggest lte/gte
- If two date fields exist (start/end) → suggest date_after/date_before
- If a password + confirm password exist → suggest equals
- If a number field alone exists → suggest gte "0" (or a reasonable lower bound) using staticValue
- If a date field that implies a deadline or birth date exists → suggest is_before_year with current year or reasonable year

OPERATOR ↔ FIELD-TYPE COMPATIBILITY MATRIX:
| Operator(s)                    | Allowed combination                                |
|--------------------------------|----------------------------------------------------|
| greater_than, less_than, gte, lte | number field ↔ number field                      |
| greater_than, less_than, gte, lte | number field ↔ numeric staticValue ("0","100")   |
| date_after, date_before        | date field ↔ date field                            |
| date_after, date_before        | date field ↔ ISO date staticValue ("YYYY-MM-DD")  |
| is_before_year                 | date field ↔ year staticValue ("YYYY")             |
| equals, not_equals             | SAME type only: password↔password, email↔email, text↔text, dropdown↔dropdown, radio↔radio |
| count_equals, count_gte, count_lte | number field (PRIMARY) ↔ checkbox field (SECONDARY) |

DERIVATION PROCEDURE:
1. List each field with its inputType.
2. Find ALL type-compatible pairs using the matrix.
3. For number+checkbox pairs → ALWAYS suggest count_equals (or count_gte/lte).
4. For number+number pairs with logical names (total/obtained, min/max) → suggest bounds.
5. For number-only fields → suggest gte "0" with staticValue.
6. For date+date pairs → suggest ordering.
7. For password pairs → suggest equals.

CRITICAL RULES:
- NEVER compare a field to itself.
- NEVER mix incompatible types.
- Number (primary) + checkbox (secondary) for count rules.
- Each rule MUST have errorMessage and description.
- If absolutely no valid relationships exist, return {"crossFieldRules": []}.

Return EXACTLY this JSON:
{
  "crossFieldRules": [
    {
      "primaryFieldLabel": "EXACT label from the field list",
      "operator": "valid_operator",
      "secondaryFieldLabel": "EXACT label from the field list OR null",
      "staticValue": "value OR null",
      "errorMessage": "Clear error message",
      "description": "Why this rule exists"
    }
  ]
}

VALID operator: "greater_than", "less_than", "gte", "lte", "equals", "not_equals", "date_after", "date_before", "count_equals", "count_gte", "count_lte", "is_before_year"

RULE EXAMPLES:
- "Team Size" (number, PRIMARY) + "Team Members" (checkbox, SECONDARY) → Team Size count_equals Team Members
- "Total Marks" (number) + "Obtained Marks" (number) → Obtained Marks lte Total Marks
- "Mark" (number, alone) → Mark gte "0" (staticValue)
- "Start Date" (date) + "End Date" (date) → End Date date_after Start Date
- "Password" (password) + "Confirm Password" (password) → Password equals Confirm Password
- "Date of Birth" (date) → Date of Birth is_before_year "2010" (staticValue)
- "Age" (number, alone) → Age gte "0" (staticValue)

CRITICAL: Use EXACT labels from the field list. Do NOT invent, capitalize differently, or invent labels.`;

      // ── PASS 1: Generate fields only ──
      const fieldsResult = await callGroq(apiKey, [
        { role: "system", content: FIELD_SYSTEM },
        { role: "user", content: `Design fields for: "${aiPrompt}"\n\nSTEP 1: Analyze the request. Identify all fields.\nSTEP 2: For each field, pick the BEST inputType.\nSTEP 3: For dropdown/radio/checkbox, include options.\n\nReturn { "formTitle": "...", "fields": [...] }` },
      ]);

      const newFields = (fieldsResult.fields || []).map((f, i) => ({
        id: Date.now() + i,
        label: f.label || `Field ${i + 1}`,
        inputType: f.inputType || 'text',
        isRequired: f.isRequired || false,
        options: f.options || [],
      }));

      const fieldLabels = newFields.map(f => f.label);
      const fieldTypeMap = {};
      newFields.forEach(f => { fieldTypeMap[f.label] = f.inputType; });

      // ── PASS 2: Generate rules from real fields ──
      const fieldsJson = newFields.map(f => ({
        label: f.label,
        inputType: f.inputType,
        options: f.options || [],
      }));

      const rulesResult = await callGroq(apiKey, [
        { role: "system", content: RULE_SYSTEM },
        { role: "user", content: `User's original form request:\n"${aiPrompt}"\n\nPreserve the requested relationship exactly. If the request says one field must equal another, use operator "equals". Do not change an equality requirement into "not_equals".\n\nGenerate ONLY type-compatible validation rules for these fields:\n\n${JSON.stringify(fieldsJson, null, 2)}\n\nReturn { "crossFieldRules": [...] }` },
      ]);

      // ── Post-process rules: normalize, repair, validate, dedupe ──
      const normalizedRules = (rulesResult.crossFieldRules || [])
        .map(r => ({
          ...r,
          primaryFieldLabel: normalizeLabel(r.primaryFieldLabel, fieldLabels),
          secondaryFieldLabel: r.secondaryFieldLabel ? normalizeLabel(r.secondaryFieldLabel, fieldLabels) : null,
        }))
        .map(r => repairRule(r, fieldTypeMap));
      const rawRules = explicitEqualityRules(aiPrompt, fieldLabels, fieldTypeMap, normalizedRules)
        .filter(r => validateRule(r, fieldLabels, fieldTypeMap))
        .map(r => {
          if (!r.errorMessage) {
            const opLabel = { greater_than: 'greater than', less_than: 'less than', gte: '≥', lte: '≤',
              equals: 'must equal', not_equals: 'must not equal', date_after: 'must be after',
              date_before: 'must be before', is_before_year: 'must be before year',
              count_equals: 'selection count must equal', count_gte: 'selection count must be ≥',
              count_lte: 'selection count must be ≤' }[r.operator] || r.operator;
            const ref = r.secondaryFieldLabel || r.staticValue;
            r.errorMessage = `"${r.primaryFieldLabel}" ${opLabel} ${ref}`;
          }
          if (!r.description) {
            r.description = `Ensures ${r.primaryFieldLabel} satisfies a type-compatible constraint`;
          }
          return r;
        });

      const newRules = dedupeRules(rawRules).map((r, i) => ({
        id: Date.now() + 2000 + i,
        primaryFieldLabel: r.primaryFieldLabel,
        operator: r.operator,
        secondaryFieldLabel: r.secondaryFieldLabel,
        staticValue: r.staticValue || null,
        errorMessage: r.errorMessage,
        description: r.description || '',
        isApproved: false,
        _reviewed: false,
      }));

      setFormTitle(fieldsResult.formTitle || 'Untitled Form');
      pushHistory(newFields, newRules);
      setFields(newFields);
      setRules(newRules);
      setApprovalStep(newRules.length > 0);
      setPublishedFormId(null);
      setPublishStatus(null);

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Generation Failed: " + error.message);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  const handleApproveRule = (ruleId) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, isApproved: true, _reviewed: true } : r));
  };

  const handleRejectRule = (ruleId) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };

  const handlePublish = async () => {
    if (fields.length === 0) {
      alert("Please add at least one field before publishing!");
      return;
    }

    setIsPublishing(true);
    setPublishStatus(null);

    try {
      const fieldLabels = new Set(fields.map(field => field.label));
      const payload = {
        title: formTitle,
        status: "ACTIVE",
        userId: user?.userId,
        themeColor: accentColor,
        description: formDescription,
        confirmationMessage: confirmationMessage,
        fields: fields.map(f => ({
          label: f.label,
          inputType: f.inputType,
          isRequired: f.isRequired,
          options: f.options || [],
        })),
        crossFieldRules: rules
          .filter(r => r.isApproved
            && fieldLabels.has(r.primaryFieldLabel)
            && (!r.secondaryFieldLabel || fieldLabels.has(r.secondaryFieldLabel)))
          .map(r => ({
            primaryFieldLabel: r.primaryFieldLabel,
            operator: r.operator,
            secondaryFieldLabel: r.secondaryFieldLabel || null,
            staticValue: r.staticValue || null,
            errorMessage: r.errorMessage,
            description: r.description || '',
            isApproved: true,
          })),
      };

      const response = await fetch(`${API_BASE}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Status: ${response.status}`);
      }

      const savedForm = await response.json();
      setPublishedFormId(savedForm.id);
      setApprovalStep(false);
      setPublishStatus('success');

    } catch (error) {
      console.error("Publish Error:", error);
      setPublishStatus('error');
      alert("Error publishing form: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const addField = () => {
    const newFields = [...fields, { id: Date.now(), label: '', inputType: 'text', isRequired: false, options: [] }];
    pushHistory(newFields);
    setFields(newFields);
  };

  const updateField = (id, key, value) => {
    const updatedFields = fields.map(f => f.id === id ? { ...f, [key]: value } : f);
    let updatedRules = rules;
    if (key === 'label') {
      const oldField = fields.find(f => f.id === id);
      if (oldField && oldField.label !== value) {
        updatedRules = rules.map(r => ({
          ...r,
          primaryFieldLabel: r.primaryFieldLabel === oldField.label ? value : r.primaryFieldLabel,
          secondaryFieldLabel: r.secondaryFieldLabel === oldField.label ? value : r.secondaryFieldLabel,
        }));
      }
    }
    pushHistory(updatedFields, updatedRules);
    setFields(updatedFields);
    if (updatedRules !== rules) setRules(updatedRules);
  };

  const removeField = (id) => {
    const removedField = fields.find(f => f.id === id);
    const newFields = fields.filter(f => f.id !== id);
    let updatedRules = rules;
    if (removedField) {
      updatedRules = rules.filter(r =>
        r.primaryFieldLabel !== removedField.label &&
        r.secondaryFieldLabel !== removedField.label
      );
    }
    pushHistory(newFields, updatedRules);
    setFields(newFields);
    setRules(updatedRules);
  };

  const approvedRulesCount = rules.filter(r => r.isApproved).length;

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 10 }}>

      {/* GOOGLE FORMS STYLE TOOLBAR */}
      <Paper elevation={0} sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        p: '8px 16px', mb: 0, borderBottom: '1px solid #e2e8f0', borderRadius: 0,
        position: 'sticky', top: '64px', zIndex: 1000, backgroundColor: '#ffffff'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px' }}>
            SureSubmit
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {formTitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Preview Form">
            <IconButton onClick={() => setPreviewOpen(true)} disabled={fields.length === 0}>
              <Visibility sx={{ color: fields.length > 0 ? '#64748b' : '#cbd5e1' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Customize Theme">
            <IconButton onClick={() => setThemeOpen(true)}><Palette sx={{ color: '#64748b' }} /></IconButton>
          </Tooltip>
          <Tooltip title="Form Settings">
            <IconButton onClick={() => setSettingsOpen(true)}><Settings sx={{ color: '#64748b' }} /></IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Undo">
            <span>
              <IconButton onClick={undo} disabled={historyIndex <= 0}>
                <Undo sx={{ color: historyIndex > 0 ? '#64748b' : '#cbd5e1' }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo sx={{ color: historyIndex < history.length - 1 ? '#64748b' : '#cbd5e1' }} />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* ACCESS CONTROL */}
          <Tooltip title="Manage Access">
            <IconButton onClick={() => setAccessOpen(true)}>
              <PersonAdd sx={{ color: '#64748b' }} />
            </IconButton>
          </Tooltip>

          {/* SHARE BUTTON (opens after publish, or pre-publish share) */}
          <Tooltip title={publishedFormId ? "Share Form" : "Publish first to share"}>
            <span>
              <IconButton onClick={() => publishedFormId ? setShareOpen(true) : null}
                disabled={!publishedFormId}
                sx={{ color: publishedFormId ? '#6366f1' : '#cbd5e1' }}>
                <Send />
              </IconButton>
            </span>
          </Tooltip>

          {/* PUBLISH BUTTON */}
          <Button
            variant="contained" onClick={handlePublish} disabled={isPublishing}
            sx={{
              backgroundColor: '#6366f1', color: '#fff', fontWeight: 700, ml: 1, px: 3,
              borderRadius: 2, textTransform: 'none',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
              '&:hover': { backgroundColor: '#4f46e5' }
            }}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </Box>
      </Paper>

      {/* PUBLISH SUCCESS SNACKBAR */}
      <Snackbar open={publishStatus === 'success'} autoHideDuration={4000} onClose={() => setPublishStatus(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => { setPublishStatus(null); setShareOpen(true); }}
              sx={{ textTransform: 'none', fontWeight: 700 }}>
              Share
            </Button>
          }>
          Form published successfully! Click Share to get the link.
        </Alert>
      </Snackbar>

      {/* SHARE DIALOG */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)}
        shareableLink={getLiveLink()} formTitle={formTitle} />

      {/* ACCESS CONTROL DIALOG */}
      <AccessControlDialog open={accessOpen} onClose={() => setAccessOpen(false)} />

      {/* SETTINGS DIALOG */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        formTitle={formTitle}
        formDescription={formDescription}
        confirmationMessage={confirmationMessage}
        accentColor={accentColor}
        onTitleChange={setFormTitle}
        onDescriptionChange={setFormDescription}
        onConfirmationChange={setConfirmationMessage}
        onColorChange={setAccentColor}
      />

      {/* PREVIEW DIALOG */}
      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        formTitle={formTitle}
        formDescription={formDescription}
        fields={fields}
        accentColor={accentColor}
      />

      <Box sx={{ maxWidth: 800, margin: '0 auto', px: 2, mt: 3 }}>

        {/* AI GENERATION CARD */}
        <Paper elevation={0} sx={{
          p: 4, mb: 4,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ede9fe 100%)',
          border: '1px solid #c4b5fd', borderRadius: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SmartToy sx={{ color: '#6366f1', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              AI Form Architect
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Describe your form. AI generates fields AND cross-field validation rules automatically.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth placeholder="e.g., Create a student enrollment form with admission year, graduation year, total marks, and obtained marks" variant="outlined"
              value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} disabled={isGenerating}
              sx={{ backgroundColor: '#fff' }} />
            <Button variant="contained" onClick={handleAIGeneration} disabled={isGenerating || !aiPrompt}
              sx={{ backgroundColor: '#6366f1', color: '#fff', px: 4, '&:hover': { backgroundColor: '#4f46e5' }, textTransform: 'none', fontWeight: 600 }}>
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </Box>
          {isGenerating && <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />}
        </Paper>

        {/* FORM TITLE */}
        <Paper elevation={0} sx={{
          p: 4, mb: 4, border: '1px solid #e2e8f0',
          borderTop: '8px solid #6366f1', borderRadius: 2
        }}>
          <TextField fullWidth variant="standard" value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)} placeholder="Form Title"
            InputProps={{ disableUnderline: true, sx: { fontSize: '2rem', fontWeight: 800, color: '#0f172a' } }} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Form description (optional)
          </Typography>
        </Paper>

        {/* HITL: RULES APPROVAL */}
        {approvalStep && rules.length > 0 && (
          <Paper elevation={0} sx={{
            p: 4, mb: 4, border: '2px solid #6366f1', borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AutoAwesome sx={{ color: '#6366f1' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                AI-Suggested Validation Rules
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              Review the cross-field rules the AI inferred. Accept valid rules, reject incorrect ones.
              Only approved rules will be enforced on the live form.
            </Typography>

            {rules.map((rule, index) => (
              <RuleCard key={rule.id} rule={rule} index={index}
                onApprove={handleApproveRule} onReject={handleRejectRule} />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Alert severity="info" sx={{ flex: 1 }}>
                {approvedRulesCount} approved / {rules.length} total rules
              </Alert>
              <Button variant="contained" onClick={() => setApprovalStep(false)}
                sx={{ ml: 2, backgroundColor: '#6366f1', textTransform: 'none', fontWeight: 600 }}>
                Done Reviewing
              </Button>
            </Box>
          </Paper>
        )}

        {/* RULES SUMMARY */}
        {!approvalStep && rules.length > 0 && (
          <Paper elevation={0} sx={{
            p: 3, mb: 4, border: '1px solid #e2e8f0', borderRadius: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rule sx={{ color: '#6366f1' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {approvedRulesCount} validation rule{approvedRulesCount !== 1 ? 's' : ''} active
              </Typography>
            </Box>
            <Button size="small" onClick={() => setApprovalStep(true)}
              sx={{ textTransform: 'none', color: '#6366f1', fontWeight: 600 }}>
              Review Rules
            </Button>
          </Paper>
        )}

        {/* FIELDS */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
          Form Fields ({fields.length})
        </Typography>
        {fields.map((field, index) => (
          <FieldCard key={field.id} field={field} index={index}
            onUpdate={updateField} onRemove={removeField} />
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={addField}
            sx={{
              border: '2px dashed #cbd5e1', color: '#64748b', fontWeight: 600,
              width: '100%', py: 1.5,
              '&:hover': { backgroundColor: '#f1f5f9', border: '2px dashed #94a3b8' }
            }}>
            Add Manual Field
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
