import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, CircularProgress
} from '@mui/material';
import { Add, Close, Delete, Edit, AutoAwesome, CalendarMonth } from '@mui/icons-material';
import { journalAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    try {
      const res = await journalAPI.getAll();
      setEntries(res.data.entries || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return toast.error('Title and content required');
    setSaving(true);
    try {
      if (editId) {
        await journalAPI.update(editId, { title, content, tags });
        toast.success('Entry updated');
      } else {
        await journalAPI.create({ title, content, tags });
        toast.success('Entry created! 📝');
      }
      setOpen(false);
      resetForm();
      fetchEntries();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await journalAPI.delete(id); toast.success('Deleted'); fetchEntries(); }
    catch { toast.error('Failed'); }
  };

  const handleEdit = (entry) => {
    setEditId(entry._id); setTitle(entry.title); setContent(entry.content);
    setTags(entry.tags || []); setOpen(true);
  };

  const getPrompt = async () => {
    setPromptLoading(true);
    try {
      const res = await journalAPI.getPrompt();
      setAiPrompt(res.data.prompt);
    } catch { setAiPrompt("What are three things you're grateful for today?"); }
    setPromptLoading(false);
  };

  const generateAIEntry = async () => {
    if (!title.trim()) {
      return toast.error('Please enter a title or topic first so the AI knows what to write about!');
    }
    if (content.trim() && !window.confirm('This will replace your current journal entry content. Do you want to proceed?')) {
      return;
    }
    setAiLoading(true);
    try {
      const res = await journalAPI.generateEntry({ title, prompt: aiPrompt });
      setContent(res.data.content);
      toast.success('Journal entry generated! 📝');
    } catch {
      toast.error('Failed to generate entry with AI');
    }
    setAiLoading(false);
  };

  const resetForm = () => { setEditId(null); setTitle(''); setContent(''); setTags([]); setTagInput(''); setAiPrompt(''); };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]); setTagInput('');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }} className="animate-fadeInUp">
        <Box>
          <Typography variant="h4" fontWeight={800}>Journal</Typography>
          <Typography variant="body2" color="text.secondary">Express your thoughts and feelings</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpen(true); }}
          sx={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', borderRadius: 3, px: 3 }}>
          New Entry
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress sx={{ color: '#0f766e' }} /></Box>
      ) : entries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }} className="animate-fadeInUp">
          <Typography sx={{ fontSize: '4rem', mb: 2 }}>📝</Typography>
          <Typography variant="h5" fontWeight={700} gutterBottom>Your Journal Awaits</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start writing to explore your inner world</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpen(true); }}
            sx={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', borderRadius: 3 }}>Write First Entry</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {entries.map((entry, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={entry._id} className="animate-fadeInUp" sx={{ animationDelay: `${i * 0.05}s` }}>
              <Card sx={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)' }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1 }}>{entry.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <IconButton size="small" onClick={() => handleEdit(entry)}><Edit sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(entry._id)} color="error"><Delete sx={{ fontSize: 16 }} /></IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                    <CalendarMonth sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />{formatDate(entry.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    flex: 1, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                  }}>{entry.content}</Typography>
                  {entry.tags?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                      {entry.tags.map(t => <Chip key={t} label={t} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: 'rgba(15,118,110,0.1)' }} />)}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{editId ? 'Edit Entry' : 'New Journal Entry'}</Typography>
          <IconButton onClick={() => setOpen(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, borderRadius: 3, background: 'rgba(15,118,110,0.05)', border: '1px solid rgba(15,118,110,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                <AutoAwesome sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5, color: '#0f766e' }} />AI Writing Prompt
              </Typography>
              <Button size="small" onClick={getPrompt} disabled={promptLoading} sx={{ color: '#0f766e' }}>
                {promptLoading ? 'Generating...' : 'Get Prompt'}
              </Button>
            </Box>
            {aiPrompt && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>"{aiPrompt}"</Typography>}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, alignItems: 'stretch' }}>
            <TextField 
              fullWidth 
              label="Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              onClick={generateAIEntry}
              disabled={aiLoading}
              startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
              sx={{
                whiteSpace: 'nowrap',
                height: { sm: 56 },
                borderColor: '#0f766e',
                color: '#0f766e',
                px: 3,
                '&:hover': {
                  borderColor: '#14b8a6',
                  backgroundColor: 'rgba(15,118,110,0.05)'
                }
              }}
            >
              {aiLoading ? 'Writing...' : 'Write with AI'}
            </Button>
          </Box>
          <TextField fullWidth multiline rows={8} label="Write your thoughts..." value={content} onChange={(e) => setContent(e.target.value)} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <TextField size="small" label="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
            <Button variant="outlined" size="small" onClick={addTag}>Add</Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.map(t => <Chip key={t} label={t} size="small" onDelete={() => setTags(tags.filter(x => x !== t))} />)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', borderRadius: 3 }}>
            {saving ? 'Saving...' : (editId ? 'Update' : 'Save Entry')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
