import { useState } from 'react';
import { Box, Button, Typography, TextField, MenuItem, Paper, IconButton, LinearProgress } from '@mui/material';
import { DeleteOutline, Add, AutoAwesome, Palette, Visibility, Undo, Redo, ContentCopy, PersonAdd } from '@mui/icons-material';

export default function FormBuilder() {
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [fields, setFields] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);

  // --- AI Generation Handler using Groq ---
  const handleAIGeneration = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GROQ_API_KEY is missing from your .env file!");
      }

      const url = "https://api.groq.com/openai/v1/chat/completions";

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are an expert form engineer. You MUST return ONLY valid JSON. Do not include markdown formatting, code blocks, or explanations."
            },
            {
              role: "user",
              content: `Design a form structure for: "${aiPrompt}". 
              
              Return EXACTLY this JSON format:
              {
                "formTitle": "A professional title",
                "fields": [
                  { "label": "Example Field", "type": "text" }
                ]
              }
              Valid types are exactly: "text", "number", "date", or "dropdown".`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      // Failsafe to clean potential markdown backticks from AI response
      let rawText = data.choices[0].message.content.trim();
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "");
      
      const generatedData = JSON.parse(rawText);
      
      setFormTitle(generatedData.formTitle || 'Untitled Form');
      
      const newFields = (generatedData.fields || []).map((field, index) => ({
        id: Date.now() + index,
        label: field.label || `Field ${index + 1}`,
        type: field.type || 'text'
      }));
      
      setFields(newFields);

    } catch (error) {
      console.error("AI Generation Error Details:", error);
      alert("Generation Failed: " + error.message);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  // --- Database Save & Link Generation Handler ---
  const handlePublish = async () => {
    if (fields.length === 0) {
      alert("Please add at least one field before publishing!");
      return;
    }

    setIsPublishing(true);

    try {
      // Structuring exactly to match your Form.java MySQL entity
      const payload = {
        title: formTitle,
        fields: fields.map(f => f.label),
        status: "ACTIVE"
      };

      const response = await fetch('http://localhost:8080/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Status: ${response.status}`);
      }

      // 1. Get the newly saved form from Spring Boot (which contains the MySQL ID)
      const savedForm = await response.json();
      
      // 2. Generate the live shareable link using that ID
      const publicLink = `http://localhost:5173/form/${savedForm.id}`;
      
      // 3. Display the link to the user
      setShareableLink(publicLink);

    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving form to backend: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const addField = () => {
    setFields([...fields, { id: Date.now(), label: '', type: 'text' }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(field => field.id === id ? { ...field, [key]: value } : field));
  };

  const removeField = (id) => {
    setFields(fields.filter(field => field.id !== id));
  };

  // Copy Link to Clipboard Tool
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    alert("Link copied! It is now stored in your Dashboard history.");
  };

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      
      {/* --- 1. GOOGLE FORMS STYLE TOP TOOLBAR --- */}
      <Paper elevation={0} sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: '12px 24px', 
        mb: 4, 
        borderBottom: '1px solid #e2e8f0', 
        borderRadius: 0,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff'
      }}>
        {/* Left Side: Document Name (Editable) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px' }}>
            SureSubmit
          </Typography>
        </Box>

        {/* Right Side: Tools & Publish Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton title="Customize Theme"><Palette sx={{ color: '#64748b' }} /></IconButton>
          <IconButton title="Preview"><Visibility sx={{ color: '#64748b' }} /></IconButton>
          <IconButton title="Undo"><Undo sx={{ color: '#64748b' }} /></IconButton>
          <IconButton title="Redo"><Redo sx={{ color: '#64748b' }} /></IconButton>
          <IconButton title="Manage Access (Who can view)"><PersonAdd sx={{ color: '#64748b' }} /></IconButton>

          <Button 
            variant="contained" 
            onClick={handlePublish}
            disabled={isPublishing}
            sx={{ 
              backgroundColor: '#6366f1', 
              color: '#ffffff', 
              fontWeight: 700, 
              ml: 2, 
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)',
              '&:hover': { backgroundColor: '#4f46e5', boxShadow: '0 6px 8px rgba(99, 102, 241, 0.3)' } 
            }}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </Box>
      </Paper>

      {/* --- 2. SUCCESS DROPDOWN (Link Generation) --- */}
      {shareableLink && (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#166534', fontWeight: 700 }}>🎉 Form Published & Saved to History!</Typography>
              <Typography variant="body2" sx={{ color: '#15803d' }}>Your form is live. Share this link to start collecting data.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField 
                size="small"
                value={shareableLink}
                InputProps={{ readOnly: true }}
                sx={{ backgroundColor: '#ffffff', width: '300px', borderRadius: 1 }}
              />
              <Button 
                variant="contained" 
                startIcon={<ContentCopy />} 
                onClick={handleCopyLink}
                sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#16a34a' }, textTransform: 'none', fontWeight: 600 }}
              >
                Copy Link
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* --- MAIN BUILDER CANVAS --- */}
      <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
        
        {/* AI GENERATION CARD */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', border: '1px solid #cbd5e1', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: '#6366f1' }} />
            Generate with AI (Powered by Groq & Llama 3)
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
            Describe the form you want to build, and our AI will instantly generate the fields and logic.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="e.g., Create a student registration form with name, email, and mark..."
              variant="outlined"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isGenerating}
              sx={{ backgroundColor: '#ffffff' }}
            />
            <Button 
              variant="contained" 
              onClick={handleAIGeneration}
              disabled={isGenerating || !aiPrompt}
              sx={{ backgroundColor: '#6366f1', color: '#ffffff', px: 4, '&:hover': { backgroundColor: '#4f46e5' }, textTransform: 'none', fontWeight: 600 }}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </Box>
          {isGenerating && <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />}
        </Paper>

        {/* FORM TITLE */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderTop: '8px solid #6366f1', borderRadius: 2 }}>
          <TextField
            fullWidth
            variant="standard"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form Title"
            InputProps={{ disableUnderline: true, sx: { fontSize: '2rem', fontWeight: 800, color: '#0f172a' } }}
          />
        </Paper>

        {/* FIELDS MAPPING */}
        {fields.map((field, index) => (
          <Paper key={field.id} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 3, alignItems: 'flex-start', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 700, pt: 1 }}>{index + 1}.</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="Field Label" variant="outlined" value={field.label} onChange={(e) => updateField(field.id, 'label', e.target.value)} />
              <TextField select label="Input Type" value={field.type} onChange={(e) => updateField(field.id, 'type', e.target.value)} sx={{ width: '200px' }}>
                <MenuItem value="text">Short Text</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="dropdown">Dropdown</MenuItem>
              </TextField>
            </Box>
            <IconButton color="error" onClick={() => removeField(field.id)} sx={{ mt: 1 }}><DeleteOutline /></IconButton>
          </Paper>
        ))}

        {/* ADD MANUAL FIELD BUTTON */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={addField} 
            sx={{ border: '2px dashed #cbd5e1', color: '#64748b', fontWeight: 600, width: '100%', py: 1.5, '&:hover': { backgroundColor: '#f1f5f9', border: '2px dashed #94a3b8' } }}
          >
            Add Manual Field
          </Button>
        </Box>

      </Box>
    </Box>
  );
}