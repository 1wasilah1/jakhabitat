import express from 'express';
import { trackPageView, trackEvent, getAnalyticsData } from './analytics.js';

const router = express.Router();

// Track page view
router.post('/track/pageview', async (req, res) => {
  try {
    const data = {
      pagePath: req.body.pagePath,
      userIp: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
      sessionId: req.body.sessionId || req.sessionID
    };
    
    await trackPageView(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Track pageview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track event
router.post('/track/event', async (req, res) => {
  try {
    const data = {
      eventType: req.body.eventType,
      eventData: req.body.eventData,
      userIp: req.ip || req.connection.remoteAddress,
      sessionId: req.body.sessionId || req.sessionID
    };
    
    await trackEvent(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics data
router.get('/data', async (req, res) => {
  try {
    const data = await getAnalyticsData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get analytics data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;