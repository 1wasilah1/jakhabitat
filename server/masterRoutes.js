import express from 'express';
import { 
  createUnit, 
  getUnits, 
  updateUnit, 
  deleteUnit,
  createHarga,
  getHarga,
  updateHarga,
  deleteHarga
} from './masterData.js';

const router = express.Router();

// Master Unit Routes
router.get('/master-unit', async (req, res) => {
  try {
    const units = await getUnits();
    res.json({ success: true, data: units });
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/master-unit', async (req, res) => {
  try {
    const result = await createUnit(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/master-unit/:id/edit', async (req, res) => {
  try {
    const result = await updateUnit(req.params.id, req.body);
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
  }
});

router.post('/master-unit/:id/delete', async (req, res) => {
  try {
    const result = await deleteUnit(req.params.id);
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
  }
});

// Master Harga Routes
router.get('/master-harga', async (req, res) => {
  try {
    const harga = await getHarga();
    res.json({ success: true, data: harga });
  } catch (error) {
    console.error('Error getting harga:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/master-harga', async (req, res) => {
  try {
    const result = await createHarga(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating harga:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/master-harga/:id/edit', async (req, res) => {
  try {
    const result = await updateHarga(req.params.id, req.body);
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating harga:', error);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
  }
});

router.post('/master-harga/:id/delete', async (req, res) => {
  try {
    const result = await deleteHarga(req.params.id);
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting harga:', error);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
  }
});

export default router;