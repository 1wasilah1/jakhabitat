import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'server/data/media.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Read existing media data
      let mediaData = { media: [] };
      try {
        const existingData = fs.readFileSync(dataPath, 'utf8');
        mediaData = JSON.parse(existingData);
      } catch (error) {
        return res.status(404).json({ error: 'Media data not found' });
      }

      // Find and remove the media item
      const mediaIndex = mediaData.media.findIndex((item: any) => item.id.toString() === id);
      if (mediaIndex === -1) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      const mediaItem = mediaData.media[mediaIndex];
      
      // Delete physical file if it's an uploaded file
      if ((mediaItem as any).url.includes('/media/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', (mediaItem as any).url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Remove from array
      mediaData.media.splice(mediaIndex, 1);

      // Save updated data
      fs.writeFileSync(dataPath, JSON.stringify(mediaData, null, 2));

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Delete failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}