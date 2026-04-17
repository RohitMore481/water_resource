const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// In-memory operations store
const operations = [
  {
    id: uuidv4(),
    title: 'Inspect Pipeline Segment S002–S004',
    description: 'Routine pressure check and visual inspection of main distribution line.',
    type: 'inspection',
    priority: 'medium',
    status: 'in-progress',
    assignedTo: 'Field Team Alpha',
    sensorId: 'S002',
    location: 'Treatment Plant A to Distribution Hub',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Repair Leak at Village C Junction',
    description: 'Replace corroded pipe section causing pressure loss near S007.',
    type: 'repair',
    priority: 'critical',
    status: 'open',
    assignedTo: 'Maintenance Crew B',
    sensorId: 'S007',
    location: 'Village C Tap Junction',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Replace TDS Sensor at Reservoir North',
    description: 'Sensor S001 showing erratic TDS readings. Replace unit.',
    type: 'maintenance',
    priority: 'high',
    status: 'resolved',
    assignedTo: 'Technical Team',
    sensorId: 'S001',
    location: 'North Reservoir',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET /api/operations
router.get('/', authenticate, (req, res) => {
  res.json({ operations });
});

// POST /api/operations (Admin only)
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { title, description, type, priority, assignedTo, sensorId, location, dueDate } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  const operation = {
    id: uuidv4(),
    title, description,
    type: type || 'inspection',
    priority: priority || 'medium',
    status: 'open',
    assignedTo: assignedTo || 'Unassigned',
    sensorId: sensorId || null,
    location: location || 'TBD',
    dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  operations.unshift(operation);
  res.status(201).json({ operation });
});

// PATCH /api/operations/:id
router.patch('/:id', authenticate, requireAdmin, (req, res) => {
  const op = operations.find((o) => o.id === req.params.id);
  if (!op) return res.status(404).json({ error: 'Operation not found' });

  const { status, assignedTo, priority } = req.body;
  if (status)     op.status     = status;
  if (assignedTo) op.assignedTo = assignedTo;
  if (priority)   op.priority   = priority;
  op.updatedAt = new Date().toISOString();

  res.json({ operation: op });
});

module.exports = router;
