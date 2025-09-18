import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import sharp from 'sharp';
// import fetch from 'node-fetch'; // Disabled for testing
import { initDatabase, insertPhoto, getPhotos, deletePhoto, insertHotspot, getHotspots, deleteHotspotsByPhoto } from './database.js';
import { initMasterTables, createUnit, getUnits, updateUnit, deleteUnit, createHarga, getHarga, updateHarga, deleteHarga } from './masterData.js';

const app = express();
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    
    const uploadDir = `/home/wasilah/migration/images/jakhabitat/360/${year}/${month}/${date}`;
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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

// Serve uploaded images from jakhabitat directory
app.use('/images', express.static('/home/wasilah/migration/images/jakhabitat'));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Headers:`, req.headers.authorization ? 'Token present' : 'No token');
  next();
});

// Temporary: Skip authentication for testing
const authenticateToken = (req, res, next) => {
  console.log('[AUTH] Skipping authentication for testing');
  req.user = { id: 1, username: 'test_user', role: 'admin' };
  next();
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

    // Save to database with unit association
    await insertPhoto({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category: 'panorama',
      unitId: req.body.unitId || null,
      roomCategory: req.body.category || null,
      isDefault: req.body.isDefault === 'true'
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
    console.error('Get photos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve individual image with Sharp optimization
app.get('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { w, h, q, f } = req.query; // width, height, quality, format
    const baseDir = '/home/wasilah/migration/images/jakhabitat/360';
    
    // Function to recursively search for file
    const findFile = (dir) => {
      if (!fs.existsSync(dir)) return null;
      
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          const found = findFile(fullPath);
          if (found) return found;
        } else if (item === filename) {
          return fullPath;
        }
      }
      
      return null;
    };
    
    const imagePath = findFile(baseDir);
    
    if (!imagePath || !fs.existsSync(imagePath)) {
      console.log(`Image not found: ${filename}`);
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // If no optimization params, serve original
    if (!w && !h && !q && !f) {
      return res.sendFile(imagePath);
    }
    
    // Sharp optimization
    let sharpInstance = sharp(imagePath);
    
    // Resize if width or height specified
    if (w || h) {
      const width = w ? parseInt(w) : null;
      const height = h ? parseInt(h) : null;
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'cover',
        withoutEnlargement: true
      });
    }
    
    // Set quality
    const quality = q ? Math.min(100, Math.max(10, parseInt(q))) : 80;
    
    // Set format
    const format = f || 'webp';
    switch (format) {
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        res.type('image/webp');
        break;
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality });
        res.type('image/jpeg');
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        res.type('image/png');
        break;
      default:
        sharpInstance = sharpInstance.webp({ quality });
        res.type('image/webp');
    }
    
    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'ETag': `"${filename}-${w || 'auto'}-${h || 'auto'}-${quality}-${format}"`
    });
    
    // Stream optimized image
    sharpInstance.pipe(res);
    
  } catch (error) {
    console.error('Image serve error:', error);
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

// HOTSPOT ENDPOINTS
app.post('/hotspots', authenticateToken, async (req, res) => {
  try {
    const { photoId, x, y, destination } = req.body;
    await insertHotspot({ photoId, x, y, destination });
    res.json({ success: true, message: 'Hotspot saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/hotspots/:photoId', authenticateToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const hotspots = await getHotspots(photoId);
    res.json({ success: true, hotspots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/hotspots/:photoId', authenticateToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { hotspots } = req.body;
    
    // Delete existing hotspots and insert new ones
    await deleteHotspotsByPhoto(photoId);
    
    for (const hotspot of hotspots) {
      await insertHotspot({
        photoId: parseInt(photoId),
        x: hotspot.x,
        y: hotspot.y,
        destination: hotspot.destination
      });
    }
    
    res.json({ success: true, message: 'Hotspots updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MASTER UNIT ENDPOINTS
app.post('/master-unit', authenticateToken, async (req, res) => {
  try {
    console.log('Creating unit:', req.body);
    const result = await createUnit(req.body);
    console.log('Unit created successfully');
    res.json({ success: true, message: 'Unit created successfully', data: result });
  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/master-unit', authenticateToken, async (req, res) => {
  console.log('[ENDPOINT] GET /master-unit called');
  try {
    const units = await getUnits();
    console.log('[ENDPOINT] Units retrieved:', units.length);
    res.json({ success: true, data: units });
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/master-unit/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating unit:', id, req.body);
    const result = await updateUnit(id, req.body);
    console.log('Unit updated successfully');
    res.json({ success: true, message: 'Unit updated successfully', data: result });
  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/master-unit/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting unit:', id);
    const result = await deleteUnit(id);
    console.log('Unit deleted successfully');
    res.json({ success: true, message: 'Unit deleted successfully', data: result });
  } catch (error) {
    console.error('Delete unit error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MASTER HARGA ENDPOINTS
app.post('/master-harga', authenticateToken, async (req, res) => {
  try {
    const hargaData = {
      unitId: req.body.unitId,
      hargaJual: req.body.hargaJual,
      hargaSewa: req.body.hargaSewa || null,
      dpMinimum: req.body.dpMinimum || 0,
      bungaTahunan: req.body.bungaTahunan || 5,
      cicilan5th: req.body.cicilan5th || null,
      cicilan7th: req.body.cicilan7th || null,
      cicilan10th: req.body.cicilan10th || null,
      cicilan11th: req.body.cicilan11th || null,
      cicilan15th: req.body.cicilan15th || null,
      cicilan20th: req.body.cicilan20th || null,
      cicilan25th: req.body.cicilan25th || null,
      cicilan30th: req.body.cicilan30th || null,
      diskon: req.body.diskon || 0,
      tanggalMulai: req.body.tanggalMulai ? new Date(req.body.tanggalMulai) : null,
      tanggalBerakhir: req.body.tanggalBerakhir ? new Date(req.body.tanggalBerakhir) : null,
      keterangan: req.body.keterangan || null,
      status: req.body.status || 'Aktif'
    };
    await createHarga(hargaData);
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
    console.error('Get harga error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/master-harga/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const hargaData = {
      unitId: req.body.unitId,
      hargaJual: req.body.hargaJual,
      hargaSewa: req.body.hargaSewa || null,
      dpMinimum: req.body.dpMinimum || 0,
      bungaTahunan: req.body.bungaTahunan || 5,
      cicilan5th: req.body.cicilan5th || null,
      cicilan7th: req.body.cicilan7th || null,
      cicilan10th: req.body.cicilan10th || null,
      cicilan11th: req.body.cicilan11th || null,
      cicilan15th: req.body.cicilan15th || null,
      cicilan20th: req.body.cicilan20th || null,
      cicilan25th: req.body.cicilan25th || null,
      cicilan30th: req.body.cicilan30th || null,
      diskon: req.body.diskon || 0,
      tanggalMulai: req.body.tanggalMulai ? new Date(req.body.tanggalMulai) : null,
      tanggalBerakhir: req.body.tanggalBerakhir ? new Date(req.body.tanggalBerakhir) : null,
      keterangan: req.body.keterangan || null,
      status: req.body.status || 'Aktif'
    };
    await updateHarga(id, hargaData);
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

// PUBLIC ENDPOINTS (no authentication required)
app.get('/public/master-unit', async (req, res) => {
  try {
    const units = await getUnits();
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/public/panoramas/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const photos = await getPhotos('panorama');
    const unitPhotos = photos.filter(photo => photo.unitId == unitId);
    res.json({ success: true, photos: unitPhotos });
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
    console.log('GET  /public/master-unit - Public units list');
    console.log('GET  /public/panoramas/:unitId - Public panoramas by unit');
  });
});