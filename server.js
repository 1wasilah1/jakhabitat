const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'public', 'jakhabitat', 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get layers
app.get('/api/layers', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'layers.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({ layers: [] });
  }
});

// Save layers
app.post('/api/layers', async (req, res) => {
  try {
    await ensureDataDir();
    await fs.writeFile(path.join(DATA_DIR, 'layers.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get units
app.get('/api/units', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'units.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({ units: [] });
  }
});

// Save units
app.post('/api/units', async (req, res) => {
  try {
    await ensureDataDir();
    await fs.writeFile(path.join(DATA_DIR, 'units.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get media
app.get('/api/media', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'media.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json({ media: [] });
  }
});

// Save media
app.post('/api/media', async (req, res) => {
  try {
    await ensureDataDir();
    await fs.writeFile(path.join(DATA_DIR, 'media.json'), JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});