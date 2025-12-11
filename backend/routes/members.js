const express = require('express');
const router = express.Router();
const {
  testEndpoint,
  getActiveMembers,
  registerMember,
  getMemberById,
  searchMembers
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/test', testEndpoint);
router.get('/search', searchMembers);

// Protected routes
router.get('/active', protect, getActiveMembers);
router.get('/:id', protect, getMemberById);
router.post('/register', protect, authorize('ADMIN', 'RECEPTION'), registerMember);

module.exports = router;