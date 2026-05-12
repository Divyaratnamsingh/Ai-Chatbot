import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Skeleton } from '@mui/material';
import { TrendingUp, EmojiEmotions, FitnessCenter, AutoAwesome } from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = ['#0f766e', '#14b8a6', '#0d9488', '#16a34a', '#84cc16', '#eab308', '#f59e0b', '#2dd4bf'];

export default function AnalyticsPage() {
  const [trends, setTrends] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [wellness, setWellness] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        analyticsAPI.getMoodTrends(days),
        analyticsAPI.getEmotionFrequency(days),
        analyticsAPI.getWellnessScore(),
        analyticsAPI.getInsights()
      ]);
      if (results[0].status === 'fulfilled') setTrends(results[0].value.data);
      if (results[1].status === 'fulfilled') setEmotions(results[1].value.data);
      if (results[2].status === 'fulfilled') setWellness(results[2].value.data);
      if (results[3].status === 'fulfilled') setInsights(results[3].value.data);
      setLoading(false);
    };
    fetchAll();
  }, [days]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }} className="animate-fadeInUp">
        <Box>
          <Typography variant="h4" fontWeight={800}>Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Your emotional wellness insights</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[7, 30, 90].map(d => (
            <Chip key={d} label={`${d} days`} size="small" onClick={() => setDays(d)}
              sx={{ cursor: 'pointer', ...(days === d ? { background: 'rgba(15,118,110,0.2)', border: '1px solid rgba(15,118,110,0.3)', fontWeight: 600 } : {}) }} />
          ))}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Wellness Score */}
        <Grid size={{ xs: 12, md: 4 }} className="animate-fadeInUp stagger-1">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <FitnessCenter sx={{ color: '#0f766e', mb: 1 }} />
              <Typography variant="overline" fontWeight={600}>Wellness Score</Typography>
              {loading ? <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', my: 2 }} /> : (
                <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                  <Box sx={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: `conic-gradient(#0f766e ${(wellness?.score || 0) * 3.6}deg, rgba(15,118,110,0.1) 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box sx={{ width: 96, height: 96, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <Typography variant="h3" fontWeight={800} sx={{ color: '#0f766e' }}>{wellness?.score || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">/ 100</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              {wellness?.breakdown && (
                <Box sx={{ textAlign: 'left', mt: 1 }}>
                  {Object.entries(wellness.breakdown).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</Typography>
                      <Typography variant="caption" fontWeight={600}>{v}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Insights */}
        <Grid size={{ xs: 12, md: 8 }} className="animate-fadeInUp stagger-2">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <AutoAwesome sx={{ verticalAlign: 'middle', mr: 1, color: '#fbbf24' }} />AI Insights
              </Typography>
              {loading ? <Skeleton height={80} /> : (
                <Box sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(135deg, rgba(15,118,110,0.05), rgba(20,184,166,0.05))', border: '1px solid rgba(15,118,110,0.1)' }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>{insights?.insight || 'Start tracking your moods to get personalized insights!'}</Typography>
                  {insights?.basedOn && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>📊 {insights.basedOn}</Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Trends Chart */}
        <Grid size={{ xs: 12, md: 8 }} className="animate-fadeInUp stagger-3">
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <TrendingUp sx={{ verticalAlign: 'middle', mr: 1, color: '#0f766e' }} />Mood Trends
              </Typography>
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.9)', border: '1px solid rgba(15,118,110,0.3)', borderRadius: 12, color: '#f1f5f9' }} />
                    <Area type="monotone" dataKey="avgMood" stroke="#0f766e" strokeWidth={2.5} fill="url(#analyticsGrad)" dot={{ fill: '#0f766e', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">No trend data yet</Typography></Box>}
            </CardContent>
          </Card>
        </Grid>

        {/* Emotion Distribution */}
        <Grid size={{ xs: 12, md: 4 }} className="animate-fadeInUp stagger-4">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <EmojiEmotions sx={{ verticalAlign: 'middle', mr: 1, color: '#fbbf24' }} />Emotions
              </Typography>
              {emotions.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={emotions.slice(0, 6)} dataKey="count" nameKey="emotion" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {emotions.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {emotions.slice(0, 6).map((e, i) => (
                      <Chip key={e.emotion} label={`${e.emotion} (${e.count})`} size="small"
                        sx={{ bgcolor: `${COLORS[i % COLORS.length]}22`, color: COLORS[i % COLORS.length], fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </>
              ) : <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">No emotion data yet</Typography></Box>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
