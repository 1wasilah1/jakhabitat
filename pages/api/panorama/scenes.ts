import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'server', 'data');
const scenesFile = path.join(dataDir, 'panorama-scenes.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(scenesFile)) {
  fs.writeFileSync(scenesFile, JSON.stringify({}));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { projectId } = req.query;
      const data = JSON.parse(fs.readFileSync(scenesFile, 'utf8'));
      const projectData = data[projectId as string] || { scenes: {} };
      
      res.status(200).json(projectData);
    } catch (error) {
      console.error('Error reading panorama scenes:', error);
      res.status(500).json({ error: 'Failed to read data' });
    }
  } else if (req.method === 'POST') {
    try {
      const { projectId, scenes } = req.body;
      
      let data = {};
      if (fs.existsSync(scenesFile)) {
        data = JSON.parse(fs.readFileSync(scenesFile, 'utf8'));
      }
      
      data[projectId] = { scenes };
      
      fs.writeFileSync(scenesFile, JSON.stringify(data, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error saving panorama scenes:', error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { projectId } = req.query;
      
      let data = {};
      if (fs.existsSync(scenesFile)) {
        data = JSON.parse(fs.readFileSync(scenesFile, 'utf8'));
      }
      
      // Delete associated image files
      const projectData = data[projectId as string];
      if (projectData?.scenes) {
        Object.values(projectData.scenes).forEach((sceneData: any) => {
          if (sceneData.scene) {
            const imagePath = path.join(process.cwd(), 'public', sceneData.scene);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        });
      }
      
      delete data[projectId as string];
      
      fs.writeFileSync(scenesFile, JSON.stringify(data, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting panorama scenes:', error);
      res.status(500).json({ error: 'Failed to delete data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}