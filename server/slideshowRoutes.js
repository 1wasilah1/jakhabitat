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

router.post('/slideshow-cards/edit/:id', async (req, res) => {
  try {
    const result = await updateSlideshowCard(req.params.id, req.body);
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating slideshow card:', error);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
  }
});

router.post('/slideshow-cards/delete/:id', async (req, res) => {
  try {
    console.log('DELETE request received for card ID:', req.params.id);
    const result = await deleteSlideshowCard(req.params.id);
    console.log('Delete operation completed successfully');
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting slideshow card:', error);
    console.error('Error stack:', error.stack);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
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

router.post('/slideshow-hotspots/delete/:id', async (req, res) => {
  console.log('🔥 HOTSPOT DELETE ROUTE HIT - ID:', req.params.id);
  try {
    console.log('🔥 Calling deleteSlideshowHotspot function...');
    const result = await deleteSlideshowHotspot(req.params.id);
    console.log('🔥 Hotspot delete completed, result:', result);
    const response = { success: true, data: result };
    console.log('🔥 Sending response:', response);
    res.status(200).set('Content-Type', 'application/json').json(response);
  } catch (error) {
    console.error('🔥 Error in hotspot delete route:', error);
    const errorResponse = { success: false, error: error.message };
    console.log('🔥 Sending error response:', errorResponse);
    res.status(500).set('Content-Type', 'application/json').json(errorResponse);
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

router.post('/icons/delete/:filename', async (req, res) => {
  try {
    const result = await deleteIcon(req.params.filename);
    res.status(200).set('Content-Type', 'application/json').json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting icon:', error);
    res.status(500).set('Content-Type', 'application/json').json({ success: false, error: error.message });
  }
});

export default router;