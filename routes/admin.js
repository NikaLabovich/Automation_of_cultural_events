const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-event => GET
router.get('/add-event', isAuth, adminController.getAddEvent);

// /admin/events => GET
router.get('/events', isAuth, adminController.getEvents);

// /admin/add-event => POST
router.post(
  '/add-event',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddEvent
);

router.get('/edit-event/:eventId', isAuth, adminController.getEditEvent);

router.post(
  '/edit-event',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditEvent
);

router.delete('/event/:eventId', isAuth, adminController.deleteEvent);

module.exports = router;
