const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// In-memory complaints store
const complaints = [
  {
    id: uuidv4(),
    title: 'Brown water from tap',
    description: 'Water from the tap is brown and has a foul smell.',
    location: 'Village A - Main Street',
    category: 'contamination',
    severity: 'high',
    status: 'in-progress',
    submittedBy: 'Ramesh Kumar',
    lat: 28.6130, lng: 77.2080,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Water pressure very low',
    description: 'Barely any water pressure since yesterday morning.',
    location: 'Village C - East Block',
    category: 'pressure',
    severity: 'medium',
    status: 'pending',
    submittedBy: 'Priya Sharma',
    lat: 28.6090, lng: 77.2020,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Pipeline burst on main road',
    description: 'Visible water leak on the main road near the school.',
    location: 'Village B - School Road',
    category: 'leak',
    severity: 'critical',
    status: 'resolved',
    submittedBy: 'Ajay Singh',
    lat: 28.6165, lng: 77.2180,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// GET /api/complaints
router.get('/', authenticate, (req, res) => {
  res.json({ complaints });
});

// POST /api/complaints
router.post('/', authenticate, (req, res) => {
  const { title, description, location, category, severity, lat, lng } = req.body;
  if (!title || !description || !location) {
    return res.status(400).json({ error: 'title, description, and location are required' });
  }

  const complaint = {
    id: uuidv4(),
    title, description, location,
    category: category || 'other',
    severity: severity || 'medium',
    status: 'pending',
    submittedBy: req.user.name,
    lat: lat || 28.6139, lng: lng || 77.2090,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  complaints.unshift(complaint);
  req.io.emit('new_complaint', complaint);
  res.status(201).json({ complaint });
});

// PATCH /api/complaints/:id (Admin only)
router.patch('/:id', authenticate, requireAdmin, (req, res) => {
  const complaint = complaints.find((c) => c.id === req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const { status, category, severity } = req.body;
  if (status) complaint.status = status;
  if (category) complaint.category = category;
  if (severity) complaint.severity = severity;
  complaint.updatedAt = new Date().toISOString();

  res.json({ complaint });
});

module.exports = router;
