import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, useMediaQuery, Badge, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon, DarkMode, LightMode, Chat, MoodOutlined,
  MenuBook, Analytics, SelfImprovement, Logout, Person, Home
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const navItems = [
  { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
  { text: 'AI Chat', icon: <Chat />, path: '/chat' },
  { text: 'Mood Tracker', icon: <MoodOutlined />, path: '/mood' },
  { text: 'Journal', icon: <MenuBook />, path: '/journal' },
  { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
  { text: 'Wellness Hub', icon: <SelfImprovement />, path: '/wellness' },
];

export default function Layout({ children, darkMode, toggleDarkMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0f766e, #14b8a6, #2dd4bf)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}
        >
          🧠 MindWell
        </Typography>
        <Typography variant="caption" color="text.secondary">
          AI Wellness Companion
        </Typography>
      </Box>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  px: 2,
                  transition: 'all 0.2s ease',
                  ...(active ? {
                    background: 'linear-gradient(135deg, rgba(15,118,110,0.15), rgba(20,184,166,0.1))',
                    border: '1px solid rgba(15,118,110,0.2)',
                    '& .MuiListItemIcon-root': { color: '#0f766e' },
                    '& .MuiListItemText-primary': { color: '#0f766e', fontWeight: 600 },
                  } : {
                    '&:hover': {
                      background: 'rgba(15,118,110,0.08)',
                      transform: 'translateX(4px)',
                    }
                  })
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, transition: 'color 0.2s' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Box sx={{
          p: 2, borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(15,118,110,0.1), rgba(20,184,166,0.1))',
          border: '1px solid rgba(15,118,110,0.15)',
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary" display="block">
            🌟 Remember
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Your mental health matters. Take one step at a time.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: darkMode
            ? 'rgba(10, 14, 26, 0.8)'
            : 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
            {navItems.find(n => n.path === location.pathname)?.text || 'MindWell'}
          </Typography>
          <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleDarkMode} sx={{ mr: 1 }}>
              {darkMode ? <LightMode sx={{ color: '#fbbf24' }} /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              sx={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                fontSize: '0.9rem', fontWeight: 700
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: 3, mt: 1, minWidth: 180 } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          pt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
