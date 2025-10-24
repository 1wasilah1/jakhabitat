import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'server/data/layer4-projects.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      res.status(200).json(data);
    } catch (error) {
      res.status(200).json({ projects: [] });
    }
  } else if (req.method === 'POST') {
    try {
      fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  }
}