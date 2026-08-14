import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box, ThemeProvider, createTheme, CssBaseline, Paper, Divider } from '@mui/material';
// 👇 CHANGED: Using Named Imports for Icons so Vite doesn't crash
import { Create, FormatListBulleted, SettingsInputComponent } from '@mui/icons-material';
import FormBuilder from './pages/FormBuilder'; 

const bespokeTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f172a' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
  }
});

function HomePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>
          FORM ENGINEERING PLATFORM
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, letterSpacing: '-1px', lineHeight: 1.2 }}>
          Build dynamic forms with absolute precision.
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400, lineHeight: 1.6 }}>
          A structured engine for data collection, featuring advanced cross-field validation and secure submission handling.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* 👇 CHANGED: Using <Create /> instead of <CreateIcon /> */}
          <Button variant="contained" color="primary" size="large" startIcon={<Create />} onClick={() => navigate('/build')} sx={{ px: 4, py: 1.5 }}>
            New Form
          </Button>
          <Button variant="text" color="primary" size="large" startIcon={<FormatListBulleted />} sx={{ px: 3, py: 1.5 }}>
            View Submissions
          </Button>
        </Box>
      </Box>
      <Box sx={{ flex: 1, width: '100%' }}>
        <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>System Status</Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Database Connection</Typography>
            <Typography sx={{ color: '#10b981', fontWeight: 700 }}>Active</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Active Forms</Typography>
            <Typography sx={{ fontWeight: 700 }}>0</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Total Submissions</Typography>
            <Typography sx={{ fontWeight: 700 }}>0</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={bespokeTheme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar sx={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            {/* 👇 CHANGED */}
            <SettingsInputComponent sx={{ mr: 2, color: '#0f172a' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.5px' }}>
              SureSubmit
            </Typography>
            <Button variant="outlined" color="primary" sx={{ border: '2px solid #0f172a', '&:hover': { border: '2px solid #0f172a', backgroundColor: '#f1f5f9' } }}>
              Documentation
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/build" element={<FormBuilder />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;