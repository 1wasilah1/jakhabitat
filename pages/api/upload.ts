import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

const dataPath = path.join(process.cwd(), 'server/data/media.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/media/uploads'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/media/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Compress image if it's an image file (except GIF)
    const isImage = file.mimetype?.startsWith('image/');
    const isGif = file.mimetype === 'image/gif';
    const originalPath = file.filepath;
    
    if (isImage && !isGif) {
      const isPng = file.mimetype === 'image/png';
      const extension = isPng ? '.png' : '.jpg';
      const compressedPath = path.join(uploadDir, `compressed-${Date.now()}${extension}`);
      
      if (isPng) {
        // Keep PNG format to preserve transparency
        await sharp(originalPath)
          .resize(4096, 2048, { fit: 'inside', withoutEnlargement: true })
          .png({ quality: 95 })
          .toFile(compressedPath);
      } else {
        // Convert other formats to JPEG
        await sharp(originalPath)
          .resize(4096, 2048, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 95 })
          .toFile(compressedPath);
      }
      
      // Remove original and update file path
      fs.unlinkSync(originalPath);
      file.filepath = compressedPath;
      file.size = fs.statSync(compressedPath).size;
    }
    // GIF files are kept as-is without compression

    // Read existing media data
    let mediaData = { media: [] };
    try {
      const existingData = fs.readFileSync(dataPath, 'utf8');
      mediaData = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist, use empty array
    }

    // Create new media entry
    const newMedia = {
      id: Date.now(),
      name: file.originalFilename || 'Unknown',
      type: file.mimetype?.startsWith('image/') ? 'image' : 'video',
      category: 'Upload',
      url: `/media/uploads/${path.basename(file.filepath)}`,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    (mediaData.media as any).push(newMedia);

    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(mediaData, null, 2));

    res.status(200).json({ success: true, media: newMedia });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}