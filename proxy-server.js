const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for dance events API
app.get('/api/events', async (req, res) => {
  try {
    const { page = 1, per_page = 25 } = req.query;
    const token = '55493fc73a27d20a9ac3402e8b5eff61';
    
    const url = `https://www.dance-events.info/api/v1/events.json?token=${token}&page=${page}&per_page=${per_page}`;
    
    console.log('🧪 Proxy: Fetching from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('🧪 Proxy: Fetched', data.events?.length || 0, 'events');
    
    res.json(data);
  } catch (error) {
    console.error('🧪 ❌ Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(PORT, () => {
  console.log(`🧪 Proxy server running on http://localhost:${PORT}`);
});




