import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, LinearProgress, Skeleton
} from '@mui/material';
import {
  Chat, MoodOutlined, MenuBook, Analytics, SelfImprovement,
  TrendingUp, EmojiEmotions, LocalFireDepartment
} from '@mui/icons-material';
import { moodAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const quickActions = [
  { title: 'AI Chat', desc: 'Talk to MindWell', icon: <Chat />, path: '/chat', gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)' },
  { title: 'Log Mood', desc: 'Track your feelings', icon: <MoodOutlined />, path: '/mood', gradient: 'linear-gradient(135deg, #16a34a, #4ade80)' },
  { title: 'Journal', desc: 'Write your thoughts', icon: <MenuBook />, path: '/journal', gradient: 'linear-gradient(135deg, #0f766e, #86efac)' },
  { title: 'Wellness', desc: 'Breathe & relax', icon: <SelfImprovement />, path: '/wellness', gradient: 'linear-gradient(135deg, #65a30d, #a3e635)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, wellnessRes] = await Promise.allSettled([
          moodAPI.getStats(7),
          analyticsAPI.getWellnessScore()
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (wellnessRes.status === 'fulfilled') setWellness(wellnessRes.value.data);
      } catch (e) { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😊'];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Hero Section */}
      <Box
        className="animate-fadeInUp"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 5,
          background: 'linear-gradient(135deg, rgba(15,118,110,0.15), rgba(22,163,74,0.1), rgba(134,239,172,0.08))',
          border: '1px solid rgba(15,118,110,0.15)',
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: -30, right: -30, width: 150, height: 150,
          borderRadius: '50%', background: 'rgba(15,118,110,0.1)', filter: 'blur(40px)'
        }} />
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          How are you feeling today? Take a moment to check in with yourself.
          Your mental wellness journey continues here.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={action.title} className="animate-fadeInUp" sx={{ animationDelay: `${i * 0.1}s` }}>
            <Card
              onClick={() => navigate(action.path)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(15,118,110,0.15)' },
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Box sx={{
                  width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 1.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: action.gradient, color: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                }}>
                  {action.icon}
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>{action.title}</Typography>
                <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Row */}
      <Grid container spacing={3}>
        {/* Wellness Score */}
        <Grid size={{ xs: 12, md: 4 }} className="animate-fadeInUp stagger-1">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Wellness Score
              </Typography>
              {loading ? <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto', my: 2 }} /> : (
                <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                  <Box sx={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: `conic-gradient(#0f766e ${(wellness?.score || 0) * 3.6}deg, rgba(15,118,110,0.1) 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box sx={{
                      width: 80, height: 80, borderRadius: '50%',
                      bgcolor: 'background.paper', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography variant="h4" fontWeight={800} sx={{ color: '#0f766e' }}>
                        {wellness?.score || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                Based on your activity this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Streak */}
        <Grid size={{ xs: 12, md: 4 }} className="animate-fadeInUp stagger-2">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Current Streak
              </Typography>
              <Box sx={{ my: 2 }}>
                <LocalFireDepartment sx={{ fontSize: 48, color: '#f59e0b' }} />
                <Typography variant="h3" fontWeight={800}>
                  {loading ? <Skeleton width={60} sx={{ mx: 'auto' }} /> : (stats?.streak || 0)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stats?.streak > 0 ? 'days of mood tracking!' : 'Start tracking today!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Mood */}
        <Grid size={{ xs: 12, md: 4 }} className="animate-fadeInUp stagger-3">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600}>
                Average Mood (7 days)
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="h2">
                  {loading ? <Skeleton width={60} sx={{ mx: 'auto' }} /> : moodEmojis[Math.round(stats?.averageMood || 0)] || '😐'}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.averageMood || '—'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stats?.totalEntries || 0} entries this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Emotions */}
      {stats?.emotionFrequency && Object.keys(stats.emotionFrequency).length > 0 && (
        <Card sx={{ mt: 3 }} className="animate-fadeInUp stagger-4">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              <EmojiEmotions sx={{ verticalAlign: 'middle', mr: 1, color: '#fbbf24' }} />
              Your Top Emotions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {Object.entries(stats.emotionFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([emotion, count]) => (
                  <Chip
                    key={emotion}
                    label={`${emotion} (${count})`}
                    sx={{
                      background: 'rgba(15,118,110,0.1)',
                      border: '1px solid rgba(15,118,110,0.2)',
                      fontWeight: 500,
                    }}
                  />
                ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
