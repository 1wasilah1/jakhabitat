import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'server/data/landing-icons.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        const icons = JSON.parse(data);
        res.status(200).json({ icons });
      } else {
        // Return default positions
        const defaultIcons = [
          { id: 'htm', name: 'HTM', src: '/landing/HTM.png', x: 0, y: 25, link: '/home#program-htm', width: 16, height: 16 },
          { id: 'rusun', name: 'RUSUN', src: '/landing/RUSUN.png', x: 50, y: 0, link: '', width: 16, height: 16 },
          { id: 'ktv', name: 'KTV', src: '/landing/KTV.png', x: 100, y: 25, link: '', width: 16, height: 16 },
          { id: 'capcip', name: 'CAP CIP', src: '/landing/CAP CIP PNG.png', x: 0, y: 60, link: '', width: 16, height: 16 },
          { id: 'rtlh', name: 'RTLH', src: '/landing/RTLH.png', x: 100, y: 60, link: '', width: 16, height: 16 },
          { id: 'minigame', name: 'MINI GAME', src: '/landing/MINI GAME.png', x: 50, y: 100, link: '/flag-game', width: 16, height: 16 }
        ];
        res.status(200).json({ icons: defaultIcons });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to load landing icons' });
    }
  } else if (req.method === 'POST') {
    try {
      const { icons } = req.body;
      
      // Ensure directory exists
      const dir = path.dirname(dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(dataPath, JSON.stringify(icons, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save landing icons' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}