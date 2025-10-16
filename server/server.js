import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/jakhabitat', express.static(path.join(__dirname, '../public')));
app.use('/api/files', express.static(path.join(__dirname, 'data')));

// Ensure media directories exist
const mediaTypes = ['panorama360', 'object360', 'icon', 'video'];
mediaTypes.forEach(type => {
  const dir = path.join(__dirname, '../public/media', type);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'panorama360';
    const uploadPath = path.join(__dirname, '../public/media', type);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const type = req.body.type || 'panorama360';
    
    if (type === 'panorama360') {
      const { layerName, unitName, typeName, roomType } = req.body;
      const cleanLayer = (layerName || 'layer').replace(/\s+/g, '-').toLowerCase();
      const cleanUnit = (unitName || 'unit').replace(/\s+/g, '-').toLowerCase();
      const cleanType = (typeName || 'type').replace(/\s+/g, '-').toLowerCase();
      const cleanRoom = (roomType || 'room').replace(/\s+/g, '-').toLowerCase();
      cb(null, `${cleanLayer}_${cleanUnit}_${cleanType}_${cleanRoom}_${timestamp}${ext}`);
    } else {
      cb(null, `${type}_${timestamp}${ext}`);
    }
  }
});

const upload = multer({ storage });

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/jakhabitat/media/${req.body.type}/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data endpoints - move to backend
const dataPath = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Get data
app.get('/api/data/:type', (req, res) => {
  try {
    const { type } = req.params;
    const filePath = path.join(dataPath, `${type}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      res.json({ [type]: [] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save data with auto-increment ID
app.post('/api/data/:type', (req, res) => {
  try {
    const { type } = req.params;
    const filePath = path.join(dataPath, `${type}.json`);
    
    // Auto-increment IDs for new items
    if (req.body[type] && Array.isArray(req.body[type])) {
      req.body[type].forEach(item => {
        if (!item.id || item.id === 0) {
          const existingIds = req.body[type].map(i => i.id || 0);
          item.id = Math.max(...existingIds, 0) + 1;
        }
      });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marzipano hotspot management
app.get('/api/marzipano/:project/hotspots', (req, res) => {
  const { project } = req.params;
  const dataPath = path.join(__dirname, '..', 'public', 'marzipano', project, 'app-files', 'data.js');
  
  try {
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf8');
      const match = content.match(/var APP_DATA = ({[\s\S]*?});/);
      if (match) {
        const data = eval('(' + match[1] + ')');
        const hotspots = data.scenes[0]?.infoHotspots || [];
        res.json({ hotspots });
      } else {
        res.json({ hotspots: [] });
      }
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read hotspots' });
  }
});

app.post('/api/marzipano/:project/hotspots', (req, res) => {
  const { project } = req.params;
  const { title, text, yaw, pitch, icon, targetProject } = req.body;
  const dataPath = path.join(__dirname, '..', 'public', 'marzipano', project, 'app-files', 'data.js');
  
  try {
    if (fs.existsSync(dataPath)) {
      let content = fs.readFileSync(dataPath, 'utf8');
      const match = content.match(/var APP_DATA = ({[\s\S]*?});/);
      
      if (match) {
        const data = eval('(' + match[1] + ')');
        
        // Add new hotspot
        if (!data.scenes[0].infoHotspots) {
          data.scenes[0].infoHotspots = [];
        }
        
        data.scenes[0].infoHotspots.push({
          yaw: parseFloat(yaw),
          pitch: parseFloat(pitch),
          title: title,
          text: text
        });
        
        // Write back to file
        const newContent = content.replace(
          /var APP_DATA = {[\s\S]*?};/,
          `var APP_DATA = ${JSON.stringify(data, null, 2)};`
        );
        
        fs.writeFileSync(dataPath, newContent, 'utf8');
        res.json({ success: true, message: 'Hotspot saved' });
      } else {
        res.status(400).json({ error: 'Invalid data format' });
      }
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save hotspot' });
  }
});

app.delete('/api/marzipano/:project/hotspots/:id', (req, res) => {
  const { project, id } = req.params;
  const dataPath = path.join(__dirname, '..', 'public', 'marzipano', project, 'app-files', 'data.js');
  
  try {
    if (fs.existsSync(dataPath)) {
      let content = fs.readFileSync(dataPath, 'utf8');
      const match = content.match(/var APP_DATA = ({[\s\S]*?});/);
      
      if (match) {
        const data = eval('(' + match[1] + ')');
        
        // Remove hotspot by title
        if (data.scenes[0]?.infoHotspots) {
          data.scenes[0].infoHotspots = data.scenes[0].infoHotspots.filter(
            hotspot => hotspot.title.toLowerCase() !== id.replace('-hotspot', '').toLowerCase()
          );
        }
        
        // Write back to file
        const newContent = content.replace(
          /var APP_DATA = {[\s\S]*?};/,
          `var APP_DATA = ${JSON.stringify(data, null, 2)};`
        );
        
        fs.writeFileSync(dataPath, newContent, 'utf8');
        res.json({ success: true, message: 'Hotspot deleted' });
      } else {
        res.status(400).json({ error: 'Invalid data format' });
      }
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hotspot' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});