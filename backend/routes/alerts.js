const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const alertsStore = require('../simulation/alertsStore');

const router = express.Router();

// GET /api/alerts
router.get('/', authenticate, (req, res) => {
  const alerts = alertsStore.getAlerts();
  res.json({ alerts });
});

// PATCH /api/alerts/:id/resolve
router.patch('/:id/resolve', authenticate, (req, res) => {
  const alert = alertsStore.resolveAlert(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  req.io.emit('alert_resolved', { id: req.params.id });
  res.json({ success: true, alert });
});

module.exports = router;
