import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { initDatabase, insertPhoto, getPhotos, deletePhoto } from './database.js';
import { initMasterTables, createUnit, getUnits, updateUnit, deleteUnit, createHarga, getHarga, updateHarga, deleteHarga } from './masterData.js';

const app = express();
app.use(cors());

// Ensure upload directory exists
const uploadDir = '/home/wasilah/migration/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For development, accept mock tokens
  if (token.startsWith('mock_access_token_')) {
    req.user = { id: 1, username: 'mock_user' };
    return next();
  }

  // For production, validate with SSO
  // This is a simplified validation - in production you'd verify with SSO server
  if (token.length > 10) {
    req.user = { id: 1, username: 'authenticated_user' };
    return next();
  }

  return res.status(403).json({ error: 'Invalid token' });
};

// Root endpoint for testing
app.get('/', (req, res) => {
  res.json({ message: 'Jakhabitat API Server', status: 'running' });
});

// Upload panorama endpoint
app.post('/upload/panorama', authenticateToken, upload.single('panorama'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save to database
    await insertPhoto({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: 'panorama'
    });

    res.json({
      success: true,
      message: 'Panorama uploaded successfully',
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get uploaded panoramas
app.get('/panoramas', authenticateToken, async (req, res) => {
  try {
    const photos = await getPhotos('panorama');
    res.json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete panorama
app.delete('/panoramas/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await deletePhoto(id);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MASTER UNIT ENDPOINTS
app.post('/master-unit', authenticateToken, async (req, res) => {
  try {
    await createUnit(req.body);
    res.json({ success: true, message: 'Unit created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/master-unit', authenticateToken, async (req, res) => {
  try {
    const units = await getUnits();
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/master-unit/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await updateUnit(id, req.body);
    res.json({ success: true, message: 'Unit updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/master-unit/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUnit(id);
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MASTER HARGA ENDPOINTS
app.post('/master-harga', authenticateToken, async (req, res) => {
  try {
    await createHarga(req.body);
    res.json({ success: true, message: 'Harga created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/master-harga', authenticateToken, async (req, res) => {
  try {
    const harga = await getHarga();
    res.json({ success: true, data: harga });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/master-harga/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await updateHarga(id, req.body);
    res.json({ success: true, message: 'Harga updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/master-harga/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteHarga(id);
    res.json({ success: true, message: 'Harga deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 6000;

// Initialize database and start server
Promise.all([initDatabase(), initMasterTables()]).then(() => {
  app.listen(PORT, () => {
    console.log(`Jakhabitat API Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('GET  / - Server status');
    console.log('POST /upload/panorama - Upload panorama');
    console.log('GET  /panoramas - List panoramas');
    console.log('DELETE /panoramas/:id - Delete panorama');
    console.log('POST /master-unit - Create unit');
    console.log('GET  /master-unit - List units');
    console.log('PUT  /master-unit/:id - Update unit');
    console.log('DELETE /master-unit/:id - Delete unit');
    console.log('POST /master-harga - Create harga');
    console.log('GET  /master-harga - List harga');
    console.log('PUT  /master-harga/:id - Update harga');
    console.log('DELETE /master-harga/:id - Delete harga');
  });
});