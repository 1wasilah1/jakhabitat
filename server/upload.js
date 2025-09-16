import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import fetch from 'node-fetch';
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

// Auth middleware with role validation
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For development, accept mock tokens
  if (token.startsWith('mock_access_token_')) {
    req.user = { id: 1, username: 'updp', role: 'admin' };
    return next();
  }

  try {
    // Validate token with SSO auth/me endpoint
    const response = await fetch('https://dprkp.jakarta.go.id/api/sso/v1/auth/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ app_id: 9 }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const userData = result.data;
    
    // Check if user has required role (updp or admin)
    if (!userData.username || (userData.username !== 'updp' && userData.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied. Only updp user or admin role allowed.' });
    }

    req.user = {
      id: userData.id,
      username: userData.username,
      role: userData.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(403).json({ error: 'Token validation failed' });
  }
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
    // Ensure clean JSON serialization
    const cleanPhotos = JSON.parse(JSON.stringify(photos));
    res.json({ success: true, photos: cleanPhotos });
  } catch (error) {
    console.error('Get photos error:', error);
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
    // Ensure clean JSON serialization
    const cleanUnits = JSON.parse(JSON.stringify(units));
    res.json({ success: true, data: cleanUnits });
  } catch (error) {
    console.error('Get units error:', error);
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
    // Ensure clean JSON serialization
    const cleanHarga = JSON.parse(JSON.stringify(harga));
    res.json({ success: true, data: cleanHarga });
  } catch (error) {
    console.error('Get harga error:', error);
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