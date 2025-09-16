import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { initDatabase, insertPhoto, getPhotos, deletePhoto } from './database.js';

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

// Upload panorama endpoint
app.post('/api/upload/panorama', upload.single('panorama'), async (req, res) => {
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
app.get('/api/panoramas', async (req, res) => {
  try {
    const photos = await getPhotos('panorama');
    res.json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete panorama
app.delete('/api/panoramas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deletePhoto(id);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Upload server running on port ${PORT}`);
  });
});