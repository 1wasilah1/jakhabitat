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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    // Ensure upload directory exists
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;

    if (!file || !projectId) {
      return res.status(400).json({ error: 'File and project ID required' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'panorama';
    const extension = path.extname(originalName);
    const newFilename = `panorama-${projectId}-${timestamp}${extension}`;
    const newPath = path.join(uploadDir, newFilename);

    // Compress and save image
    await sharp(file.filepath)
      .resize(8192, 4096, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 95 })
      .toFile(newPath);
    
    // Remove temp file
    fs.unlinkSync(file.filepath);

    const fileUrl = `/uploads/${newFilename}`;

    res.status(200).json({
      success: true,
      url: fileUrl,
      filename: newFilename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}