import express from 'express';
import { 
  getSlideshowCards, 
  insertSlideshowCard, 
  updateSlideshowCard, 
  deleteSlideshowCard,
  getSlideshowHotspots,
  insertSlideshowHotspot,
  deleteSlideshowHotspot,
  getIcons,
  deleteIcon
} from './slideshowCards.js';

const router = express.Router();

// Slideshow Cards Routes
router.get('/slideshow-cards', async (req, res) => {
  try {
    const cards = await getSlideshowCards();
    res.json({ success: true, data: cards });
  } catch (error) {
    console.error('Error getting slideshow cards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/slideshow-cards', async (req, res) => {
  try {
    const result = await insertSlideshowCard(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating slideshow card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/slideshow-cards/:id', async (req, res) => {
  try {
    const result = await updateSlideshowCard(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating slideshow card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/slideshow-cards/:id', async (req, res) => {
  try {
    console.log('DELETE request received for card ID:', req.params.id);
    const result = await deleteSlideshowCard(req.params.id);
    console.log('Delete operation completed successfully');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting slideshow card:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Slideshow Hotspots Routes
router.get('/slideshow-hotspots/:cardId', async (req, res) => {
  try {
    const hotspots = await getSlideshowHotspots(req.params.cardId);
    res.json({ success: true, data: hotspots });
  } catch (error) {
    console.error('Error getting slideshow hotspots:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/slideshow-hotspots', async (req, res) => {
  try {
    const result = await insertSlideshowHotspot(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating slideshow hotspot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/slideshow-hotspots/:id', async (req, res) => {
  try {
    console.log('DELETE hotspot request for ID:', req.params.id);
    const result = await deleteSlideshowHotspot(req.params.id);
    console.log('Hotspot delete completed');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting slideshow hotspot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Icons Routes
router.get('/icons', async (req, res) => {
  try {
    const icons = await getIcons();
    res.json({ success: true, data: icons });
  } catch (error) {
    console.error('Error getting icons:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/icons/:filename', async (req, res) => {
  try {
    const result = await deleteIcon(req.params.filename);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting icon:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;