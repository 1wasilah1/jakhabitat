import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'server/data/media.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      // Convert media to assets format
      const assets = data.media?.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        type: item.type === 'panorama360' ? 'image' : item.type,
        url: item.url,
        size: item.size
      })) || [];
      res.status(200).json({ assets });
    } catch (error) {
      res.status(200).json({ assets: [] });
    }
  } else if (req.method === 'POST') {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { assetId } = req.query;
      
      let data = { media: [] };
      if (fs.existsSync(dataPath)) {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
      
      const asset = data.media.find((m: any) => m.id.toString() === assetId);
      if (asset) {
        const filePath = path.join(process.cwd(), 'public', asset.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        data.media = data.media.filter((m: any) => m.id.toString() !== assetId);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  }
}