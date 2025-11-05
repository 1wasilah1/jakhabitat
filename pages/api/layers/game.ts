import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'server/data/game-hotspots.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      // Support for game selection via query parameter
      const { gameId } = req.query;
      
      if (gameId && data.games) {
        const selectedGame = data.games.find((game: any) => game.id === gameId);
        if (selectedGame) {
          res.status(200).json({ 
            gameUrl: selectedGame.url, 
            gameName: selectedGame.name,
            gameDescription: selectedGame.description,
            hotspots: data.hotspots || [] 
          });
          return;
        }
      }
      
      res.status(200).json(data);
    } catch (error) {
      res.status(200).json({ 
        games: [
          {
            id: 'car-parking',
            name: 'Car Parking Puzzle',
            url: '/game/index.html',
            description: 'Keluarkan semua mobil dari area parkir!',
            icon: '🚗'
          },
          {
            id: 'punch-game',
            name: 'Punch Game', 
            url: '/game/punch-game.html',
            description: 'Ambil foto dan pukul wajah Anda sendiri!',
            icon: '🥊'
          }
        ],
        gameUrl: '/game/index.html', 
        hotspots: [] 
      });
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