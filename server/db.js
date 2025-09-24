import oracledb from 'oracledb';
import express from 'express';
import cors from 'cors';
import slideshowRoutes from './slideshowRoutes.js';
import { initSlideshowTables } from './slideshowCards.js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize tables
initSlideshowTables();

// Routes
app.use('/api/jakhabitat', slideshowRoutes);

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'Pusd4t1n2025',
  connectString: process.env.DB_CONNECT_STRING || '10.15.38.162:1539/FREEPDB1',
};

app.post('/api/db/query', async (req, res) => {
  let connection;
  try {
    const { sql, params = [] } = req.body;
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.post('/api/db/execute', async (req, res) => {
  let connection;
  try {
    const { sql, params = [] } = req.body;
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(sql, params, { autoCommit: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Database server running on port ${PORT}`);
  console.log('Slideshow routes available at /api/jakhabitat');
});