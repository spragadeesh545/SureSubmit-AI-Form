import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box, ThemeProvider, createTheme, CssBaseline, Paper, Divider, Menu, MenuItem, Avatar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, Tooltip, IconButton } from '@mui/material';
import { Create, FormatListBulleted, SettingsInputComponent, Dashboard as DashboardIcon, Home, Menu as MenuIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import FormBuilder from './pages/FormBuilder'; 
import Dashboard from './pages/Dashboard'; 
import LiveForm from './pages/LiveForm';
import Login from './pages/Login';
import Responses from './pages/Responses';
import { AuthProvider, useAuth } from './context/AuthContext';

const API_BASE = 'http://localhost:8080';
const DRAWER_WIDTH = 240;

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ textAlign: 'center', py: 10 }}><Typography sx={{ color: '#64748b' }}>Loading...</Typography></Box>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  if (!user) return null;

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };

  return (
    <>
      <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: 14, cursor: 'pointer' }}
        onClick={(e) => setAnchorEl(e.currentTarget)}>
        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
      </Avatar>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem disabled sx={{ color: '#64748b', fontSize: '0.8rem' }}>
          {user.email}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/dashboard'); }} sx={{ textTransform: 'none' }}>
          My Forms
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ textTransform: 'none', color: '#ef4444' }}>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeForms, setActiveForms] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/forms${user ? `?userId=${user.userId}` : ''}`)
      .then(r => r.json())
      .then(data => setActiveForms(data.length))
      .catch(() => {});

    fetch(`${API_BASE}/api/submissions`)
      .then(r => r.json())
      .then(data => setTotalSubmissions(data.length))
      .catch(() => {});
  }, [user]);

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
          AI-powered form creation with automatic cross-field validation rules, human-in-the-loop approval, and enterprise data sovereignty.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" size="large" startIcon={<Create />} onClick={() => navigate('/build')} sx={{ px: 4, py: 1.5 }}>
            New Form
          </Button>
          <Button variant="text" color="primary" size="large" startIcon={<FormatListBulleted />} onClick={() => navigate('/dashboard')} sx={{ px: 3, py: 1.5 }}>
            View My Forms
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
            <Typography sx={{ fontWeight: 700 }}>{activeForms}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Total Submissions</Typography>
            <Typography sx={{ fontWeight: 700 }}>{totalSubmissions}</Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

function AppNavBar({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
      <Toolbar sx={{ pl: onMenuToggle ? 1 : 2 }}>
        {onMenuToggle && (
          <Tooltip title="Toggle menu">
            <IconButton onClick={onMenuToggle} sx={{ mr: 1, color: '#475569' }}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}
        <SettingsInputComponent sx={{ mr: 2, color: '#0f172a' }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.5px', cursor: 'pointer' }}
          onClick={() => navigate('/')}>
          SureSubmit
        </Typography>
        {user ? (
          <>
            <UserMenu />
          </>
        ) : (
          <>
            <Button color="primary" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>
              Sign In
            </Button>
            <Button variant="contained" onClick={() => navigate('/login')}
              sx={{ ml: 1, backgroundColor: '#6366f1', '&:hover': { backgroundColor: '#4f46e5' } }}>
              Create Account
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function SideNav({ open }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/build') return location.pathname === '/build';
    if (path.startsWith('/responses')) return location.pathname.startsWith('/responses');
    return false;
  };

  const items = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/dashboard', label: 'My Forms', icon: <DashboardIcon /> },
    { path: '/build', label: 'New Form', icon: <Create /> },
  ];

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        transition: 'width 0.25s ease',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 0,
          overflowX: 'hidden',
          borderRight: open ? '1px solid #e2e8f0' : 'none',
          top: '64px',
          height: 'calc(100vh - 64px)',
          transition: 'width 0.25s ease',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
        },
      }}
    >
      <Box sx={{ p: 1 }}>
        <List sx={{ py: 0 }}>
          {items.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: 2,
                    backgroundColor: active ? '#f5f3ff' : 'transparent',
                    '&:hover': { backgroundColor: active ? '#ede9fe' : '#f8fafc' },
                    '& .MuiListItemIcon-root': { minWidth: 0, mr: 1.5 },
                  }}
                >
                  <ListItemIcon sx={{ color: active ? '#6366f1' : '#64748b' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: active ? 700 : 500,
                        color: active ? '#6366f1' : '#475569',
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/form/:id" element={<LiveForm />} />
      <Route path="/build" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/responses/:id" element={<ProtectedRoute><Responses /></ProtectedRoute>} />
    </Routes>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const showSidebar = user && location.pathname !== '/login';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {showSidebar && <SideNav open={sidebarOpen} />}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppNavBar
          onMenuToggle={showSidebar ? () => setSidebarOpen(!sidebarOpen) : null}
        />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <AppRoutes />
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={bespokeTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;