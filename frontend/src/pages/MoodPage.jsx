import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Skeleton
} from '@mui/material';
import { Add, Close, TrendingUp } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import { moodAPI } from '../services/api';
import toast from 'react-hot-toast';

const moodOptions = [
  { value: 1, emoji: '😢', label: 'Terrible', color: '#ef4444' },
  { value: 2, emoji: '😕', label: 'Bad', color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#eab308' },
  { value: 4, emoji: '🙂', label: 'Good', color: '#22c55e' },
  { value: 5, emoji: '😊', label: 'Great', color: '#10b981' },
];

const emotionOptions = [
  'Happy', 'Sad', 'Anxious', 'Calm', 'Excited', 'Angry',
  'Grateful', 'Lonely', 'Hopeful', 'Stressed', 'Peaceful', 'Confused',
  'Motivated', 'Tired', 'Content', 'Overwhelmed'
];

const activityOptions = [
  '🏃 Exercise', '📚 Reading', '🧘 Meditation', '🎵 Music',
  '👫 Social', '💼 Work', '🎮 Gaming', '🍳 Cooking',
  '🌿 Nature', '🎨 Creative', '📱 Screen time', '😴 Sleep'
];

export default function MoodPage() {
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [note, setNote] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => { fetchStats(); }, [timeRange]);

  const fetchStats = async () => {
    try {
      const res = await moodAPI.getStats(timeRange);
      setStats(res.data);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedMood) return toast.error('Please select a mood');
    setSaving(true);
    try {
      await moodAPI.create({
        mood: selectedMood,
        emotions: selectedEmotions,
        activities: selectedActivities,
        note
      });
      toast.success('Mood logged! 🎉');
      setOpen(false);
      resetForm();
      fetchStats();
    } catch (err) {
      toast.error('Failed to save mood');
    }
    setSaving(false);
  };

  const resetForm = () => {
    setSelectedMood(0);
    setSelectedEmotions([]);
    setSelectedActivities([]);
    setNote('');
  };

  const toggleEmotion = (e) => {
    setSelectedEmotions(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const toggleActivity = (a) => {
    setSelectedActivities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const chartData = stats?.entries?.reduce((acc, e) => {
    const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(a => a.date === date);
    if (existing) {
      existing.mood = Math.round(((existing.mood * existing.count + e.mood) / (existing.count + 1)) * 10) / 10;
      existing.count++;
    } else {
      acc.push({ date, mood: e.mood, count: 1 });
    }
    return acc;
  }, []) || [];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }} className="animate-fadeInUp">
        <Box>
          <Typography variant="h4" fontWeight={800}>Mood Tracker</Typography>
          <Typography variant="body2" color="text.secondary">Track your emotional journey</Typography>
        </Box>
        <Button
          variant="contained" startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
            borderRadius: 3, px: 3,
            '&:hover': { transform: 'translateY(-2px)' },
            transition: 'all 0.2s',
          }}
        >
          Log Mood
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Average Mood', value: stats?.averageMood || '—', emoji: moodOptions[Math.round(stats?.averageMood || 3) - 1]?.emoji || '😐', color: '#0f766e' },
          { label: 'Total Entries', value: stats?.totalEntries || 0, emoji: '📊', color: '#0d9488' },
          { label: 'Day Streak', value: stats?.streak || 0, emoji: '🔥', color: '#f59e0b' },
        ].map((s, i) => (
          <Grid size={{ xs: 4 }} key={s.label} className="animate-fadeInUp" sx={{ animationDelay: `${i * 0.1}s` }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Typography sx={{ fontSize: '2rem' }}>{s.emoji}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart */}
      <Card className="animate-fadeInUp stagger-3" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              <TrendingUp sx={{ verticalAlign: 'middle', mr: 1, color: '#0f766e' }} />
              Mood Trends
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[7, 30, 90].map(d => (
                <Chip
                  key={d}
                  label={`${d}d`}
                  size="small"
                  onClick={() => setTimeRange(d)}
                  sx={{
                    cursor: 'pointer',
                    ...(timeRange === d ? {
                      background: 'rgba(15,118,110,0.2)',
                      border: '1px solid rgba(15,118,110,0.3)',
                      fontWeight: 600,
                    } : {}),
                  }}
                />
              ))}
            </Box>
          </Box>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  contentStyle={{
                    background: 'rgba(17,24,39,0.9)',
                    border: '1px solid rgba(15,118,110,0.3)',
                    borderRadius: 12,
                    color: '#f1f5f9'
                  }}
                />
                <Area type="monotone" dataKey="mood" stroke="#0f766e" strokeWidth={2.5} fill="url(#moodGradient)" dot={{ fill: '#0f766e', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>📈</Typography>
              <Typography color="text.secondary">No mood data yet. Start logging your moods!</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {stats?.entries?.length > 0 && (
        <Card className="animate-fadeInUp stagger-4">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Recent Entries</Typography>
            {stats.entries.slice(-10).reverse().map((entry, i) => (
              <Box key={entry._id} sx={{
                display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
                borderBottom: i < Math.min(stats.entries.length, 10) - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}>
                <Typography sx={{ fontSize: '1.5rem' }}>{moodOptions[entry.mood - 1]?.emoji}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {moodOptions[entry.mood - 1]?.label} — {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  {entry.note && <Typography variant="caption" color="text.secondary">{entry.note}</Typography>}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {entry.emotions.map(e => (
                      <Chip key={e} label={e} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(15,118,110,0.1)' }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Log Mood Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>How are you feeling?</Typography>
          <IconButton onClick={() => setOpen(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Mood Selector */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, my: 3 }}>
            {moodOptions.map(m => (
              <Tooltip key={m.value} title={m.label}>
                <Box
                  onClick={() => setSelectedMood(m.value)}
                  sx={{
                    cursor: 'pointer', textAlign: 'center', p: 1.5, borderRadius: 3,
                    transition: 'all 0.2s',
                    border: selectedMood === m.value ? `2px solid ${m.color}` : '2px solid transparent',
                    background: selectedMood === m.value ? `${m.color}15` : 'transparent',
                    transform: selectedMood === m.value ? 'scale(1.15)' : 'scale(1)',
                    '&:hover': { transform: 'scale(1.1)', background: `${m.color}10` },
                  }}
                >
                  <Typography sx={{ fontSize: '2.2rem' }}>{m.emoji}</Typography>
                  <Typography variant="caption" sx={{ color: m.color, fontWeight: 600 }}>{m.label}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Emotions */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Emotions</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
            {emotionOptions.map(e => (
              <Chip key={e} label={e} size="small" onClick={() => toggleEmotion(e)}
                sx={{
                  cursor: 'pointer', transition: 'all 0.2s',
                  ...(selectedEmotions.includes(e) ? {
                    background: 'rgba(15,118,110,0.2)', border: '1px solid #0f766e', color: '#0f766e', fontWeight: 600,
                  } : {}),
                  '&:hover': { background: 'rgba(15,118,110,0.1)' },
                }}
              />
            ))}
          </Box>

          {/* Activities */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Activities</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
            {activityOptions.map(a => (
              <Chip key={a} label={a} size="small" onClick={() => toggleActivity(a)}
                sx={{
                  cursor: 'pointer', transition: 'all 0.2s',
                  ...(selectedActivities.includes(a) ? {
                    background: 'rgba(22,163,74,0.2)', border: '1px solid #16a34a', color: '#4ade80', fontWeight: 600,
                  } : {}),
                  '&:hover': { background: 'rgba(22,163,74,0.1)' },
                }}
              />
            ))}
          </Box>

          {/* Note */}
          <TextField
            fullWidth multiline rows={3}
            label="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind today?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !selectedMood}
            sx={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', borderRadius: 3 }}>
            {saving ? 'Saving...' : 'Save Mood'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
