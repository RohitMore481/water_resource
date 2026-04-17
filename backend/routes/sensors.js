const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getCurrentReadings, getSensorHistory, triggerLeak, triggerContamination, resetSimulation } = require('../simulation/sensorSimulator');
const { PIPELINE_NODES, PIPELINE_EDGES, bfsAffectedNodes, dfsPath } = require('../graph/pipeline');

const router = express.Router();

// GET /api/sensors — all current readings
router.get('/', authenticate, (req, res) => {
  res.json({ sensors: getCurrentReadings(), nodes: PIPELINE_NODES, edges: PIPELINE_EDGES });
});

// GET /api/sensors/:id/history
router.get('/:id/history', authenticate, (req, res) => {
  const history = getSensorHistory(req.params.id);
  if (!history.length) {
    return res.status(404).json({ error: 'Sensor not found or no history' });
  }
  res.json({ sensorId: req.params.id, history });
});

// GET /api/sensors/graph/affected/:id — BFS from a sensor
router.get('/graph/affected/:id', authenticate, (req, res) => {
  const affected = bfsAffectedNodes(req.params.id);
  res.json({ sourceId: req.params.id, affectedNodes: affected });
});

// POST /api/sensors/simulate-leak
router.post('/simulate-leak', authenticate, (req, res) => {
  triggerLeak(req.io);
  res.json({ success: true, message: 'Leak simulation triggered' });
});

// POST /api/sensors/simulate-contamination
router.post('/simulate-contamination', authenticate, (req, res) => {
  triggerContamination(req.io);
  res.json({ success: true, message: 'Contamination simulation triggered' });
});

// POST /api/sensors/reset
router.post('/reset', authenticate, (req, res) => {
  resetSimulation(req.io);
  res.json({ success: true, message: 'Simulation reset to normal' });
});

module.exports = router;
