import express from 'express';

const router = express.Router();

// Panorama delete route
router.post('/panoramas/delete/:id', async (req, res) => {
  try {
    console.log('DELETE panorama request for ID:', req.params.id);
    // Add actual delete logic here when panorama backend is implemented
    res.status(200).set('Content-Type', 'application/json').json({ 
      success: true, 
      message: 'Panorama deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting panorama:', error);
    res.status(500).set('Content-Type', 'application/json').json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;