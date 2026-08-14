import { useState } from 'react';
import { Box, Button, Typography, TextField, MenuItem, Paper, IconButton, LinearProgress } from '@mui/material';
import { DeleteOutline, Add, Save, AutoAwesome } from '@mui/icons-material';

export default function FormBuilder() {
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [fields, setFields] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Generation Handler using Groq
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

      const rawText = data.choices[0].message.content.trim();
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

  // Database Save Handler 
  const handleSaveForm = async () => {
    try {
      // Structuring exactly to match the Form.java entity
      const payload = {
        title: formTitle,
        fields: fields.map(f => f.label) 
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

      alert('Success! Form saved to MySQL database via Spring Boot.');
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving form to backend: " + error.message);
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

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', mt: 4, px: 2 }}>
      
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
            placeholder="e.g., Create a student registration form with name, email, and age..."
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
            sx={{ backgroundColor: '#6366f1', color: '#ffffff', px: 4, '&:hover': { backgroundColor: '#4f46e5' } }}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </Box>
        {isGenerating && <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />}
      </Paper>

      <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderTop: '6px solid #0f172a' }}>
        <TextField
          fullWidth
          variant="standard"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Form Title"
          InputProps={{ disableUnderline: true, sx: { fontSize: '2rem', fontWeight: 800, color: '#0f172a' } }}
        />
      </Paper>

      {fields.map((field, index) => (
        <Paper key={field.id} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', display: 'flex', gap: 3, alignItems: 'flex-start' }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pb: 10 }}>
        <Button variant="outlined" startIcon={<Add />} onClick={addField} sx={{ border: '2px solid #0f172a', color: '#0f172a', fontWeight: 600 }}>
          Add Manual Field
        </Button>
        <Button variant="contained" onClick={handleSaveForm} startIcon={<Save />} sx={{ backgroundColor: '#0f172a', px: 4 }}>
          Save Form Engine
        </Button>
      </Box>
    </Box>
  );
}