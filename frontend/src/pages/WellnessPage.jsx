import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, IconButton, Chip } from '@mui/material';
import { PlayArrow, Pause, Refresh, SelfImprovement, Air, FavoriteBorder } from '@mui/icons-material';

const affirmations = [
  "I am worthy of love and kindness.",
  "I choose peace over worry.",
  "My feelings are valid and I honor them.",
  "I am stronger than I think.",
  "I deserve rest and self-care.",
  "I am enough, exactly as I am.",
  "Every day is a fresh start.",
  "I trust my journey and embrace growth.",
  "I am surrounded by love and support.",
  "My mind is calm, my heart is at peace.",
  "I release what I cannot control.",
  "I am grateful for this moment.",
];

const exercises = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, desc: 'Equal parts inhale, hold, exhale, hold. Great for focus and calm.' },
  { name: '4-7-8 Relaxing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, desc: 'Dr. Weil\'s technique for deep relaxation and sleep.' },
  { name: 'Simple Calm', inhale: 4, hold1: 2, exhale: 6, hold2: 0, desc: 'Longer exhale activates the parasympathetic nervous system.' },
];

export default function WellnessPage() {
  // Breathing state
  const [breathExercise, setBreathExercise] = useState(exercises[0]);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('ready');
  const [breathCount, setBreathCount] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const breathInterval = useRef(null);

  // Meditation state
  const [medTime, setMedTime] = useState(300);
  const [medRemaining, setMedRemaining] = useState(300);
  const [medActive, setMedActive] = useState(false);
  const medInterval = useRef(null);

  // Affirmation
  const [affIdx, setAffIdx] = useState(Math.floor(Math.random() * affirmations.length));

  // Breathing logic
  useEffect(() => {
    if (!breathActive) return;
    const ex = breathExercise;
    const phases = [
      { name: 'Inhale', duration: ex.inhale, scaleEnd: 1.5 },
      { name: 'Hold', duration: ex.hold1, scaleEnd: 1.5 },
      { name: 'Exhale', duration: ex.exhale, scaleEnd: 1 },
    ];
    if (ex.hold2 > 0) phases.push({ name: 'Hold', duration: ex.hold2, scaleEnd: 1 });

    let phaseIdx = 0;
    let elapsed = 0;

    const tick = () => {
      const phase = phases[phaseIdx];
      elapsed++;
      const progress = elapsed / phase.duration;
      const prevScale = phaseIdx === 0 ? 1 : phases[phaseIdx - 1].scaleEnd;
      setCircleScale(prevScale + (phase.scaleEnd - prevScale) * progress);
      setBreathPhase(phase.name);

      if (elapsed >= phase.duration) {
        elapsed = 0;
        phaseIdx = (phaseIdx + 1) % phases.length;
        if (phaseIdx === 0) setBreathCount(c => c + 1);
      }
    };

    breathInterval.current = setInterval(tick, 1000);
    return () => clearInterval(breathInterval.current);
  }, [breathActive, breathExercise]);

  // Meditation timer
  useEffect(() => {
    if (!medActive) return;
    medInterval.current = setInterval(() => {
      setMedRemaining(prev => {
        if (prev <= 1) { setMedActive(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(medInterval.current);
  }, [medActive]);

  const stopBreath = () => { setBreathActive(false); clearInterval(breathInterval.current); setBreathPhase('ready'); setBreathCount(0); setCircleScale(1); };
  const formatMedTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box className="animate-fadeInUp" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Wellness Hub</Typography>
        <Typography variant="body2" color="text.secondary">Tools to help you relax, breathe, and find peace</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Breathing Exercise */}
        <Grid size={{ xs: 12, md: 6 }} className="animate-fadeInUp stagger-1">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <Air sx={{ verticalAlign: 'middle', mr: 1, color: '#14b8a6' }} />Breathing Exercise
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
                {exercises.map(ex => (
                  <Chip key={ex.name} label={ex.name} size="small" onClick={() => { stopBreath(); setBreathExercise(ex); }}
                    sx={{ cursor: 'pointer', ...(breathExercise.name === ex.name ? { background: 'rgba(20,184,166,0.2)', border: '1px solid rgba(20,184,166,0.3)', fontWeight: 600 } : {}) }} />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>{breathExercise.desc}</Typography>

              {/* Breathing Circle */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <Box sx={{
                  width: 160, height: 160, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(15,118,110,0.2))',
                  border: '2px solid rgba(20,184,166,0.3)',
                  transform: `scale(${circleScale})`,
                  transition: 'transform 1s ease-in-out',
                  boxShadow: breathActive ? '0 0 40px rgba(20,184,166,0.2)' : 'none',
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#14b8a6' }}>
                      {breathActive ? breathPhase : 'Ready'}
                    </Typography>
                    {breathActive && <Typography variant="caption" color="text.secondary">Cycle {breathCount + 1}</Typography>}
                  </Box>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  {!breathActive ? (
                    <Button variant="contained" startIcon={<PlayArrow />} onClick={() => setBreathActive(true)}
                      sx={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)', borderRadius: 3 }}>Start</Button>
                  ) : (
                    <Button variant="outlined" startIcon={<Pause />} onClick={stopBreath} sx={{ borderRadius: 3, borderColor: '#14b8a6', color: '#14b8a6' }}>Stop</Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Meditation Timer */}
        <Grid size={{ xs: 12, md: 6 }} className="animate-fadeInUp stagger-2">
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <SelfImprovement sx={{ verticalAlign: 'middle', mr: 1, color: '#16a34a' }} />Meditation Timer
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
                {[60, 180, 300, 600, 900].map(t => (
                  <Chip key={t} label={`${t / 60}m`} size="small"
                    onClick={() => { setMedTime(t); setMedRemaining(t); setMedActive(false); }}
                    sx={{ cursor: 'pointer', ...(medTime === t ? { background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)', fontWeight: 600 } : {}) }} />
                ))}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <Box sx={{
                  width: 160, height: 160, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `conic-gradient(#16a34a ${(medRemaining / medTime) * 360}deg, rgba(22,163,74,0.1) 0deg)`,
                  transition: 'background 1s linear',
                }}>
                  <Box sx={{
                    width: 140, height: 140, borderRadius: '50%', bgcolor: 'background.paper',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Typography variant="h3" fontWeight={700} sx={{ color: '#16a34a' }}>{formatMedTime(medRemaining)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={medActive ? <Pause /> : <PlayArrow />}
                    onClick={() => setMedActive(!medActive)}
                    sx={{ background: 'linear-gradient(135deg, #15803d, #4ade80)', borderRadius: 3 }}>
                    {medActive ? 'Pause' : (medRemaining < medTime ? 'Resume' : 'Start')}
                  </Button>
                  <IconButton onClick={() => { setMedActive(false); setMedRemaining(medTime); }}><Refresh /></IconButton>
                </Box>
                {medRemaining === 0 && <Typography variant="body2" sx={{ mt: 2, color: '#34d399' }}>🎉 Session complete! Well done.</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Affirmation */}
        <Grid size={{ xs: 12 }} className="animate-fadeInUp stagger-3">
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(15,118,110,0.1), rgba(22,163,74,0.08), rgba(20,184,166,0.06))',
            border: '1px solid rgba(15,118,110,0.15)',
          }}>
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <FavoriteBorder sx={{ fontSize: 40, color: '#ec4899', mb: 2 }} />
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontStyle: 'italic', lineHeight: 1.6 }}>
                "{affirmations[affIdx]}"
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Daily Affirmation</Typography>
              <Button size="small" onClick={() => setAffIdx((affIdx + 1) % affirmations.length)}
                sx={{ color: '#0f766e' }}>Next Affirmation →</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Resources */}
        <Grid size={{ xs: 12 }} className="animate-fadeInUp stagger-4">
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>🆘 Crisis Resources</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                If you or someone you know is in crisis, please reach out:
              </Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'Suicide Prevention Lifeline', contact: '988', desc: 'Call or text 24/7' },
                  { name: 'Crisis Text Line', contact: 'Text HOME to 741741', desc: 'Free 24/7 text support' },
                  { name: 'SAMHSA Helpline', contact: '1-800-662-4357', desc: 'Treatment referrals' },
                ].map(r => (
                  <Grid size={{ xs: 12, md: 4 }} key={r.name}>
                    <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight={700}>{r.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#0f766e', fontWeight: 600, my: 0.5 }}>{r.contact}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
