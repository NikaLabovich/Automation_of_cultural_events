const path = require('path');

const express = require('express');

const posterController = require('../controllers/poster');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', posterController.getIndex);

router.get('/events', posterController.getEvents);

router.get('/events/:eventId', posterController.getEvent);

router.get('/subscribes', isAuth, posterController.getSubscribes);

router.post('/subscribes', isAuth, posterController.postSubscribes);

router.post('/subscribes-delete-item', isAuth, posterController.postSubscribesDeleteEvent);

router.get('/checkout', isAuth, posterController.getCheckout);

router.get('/checkout/success', posterController.getCheckoutSuccess);

router.get('/checkout/cancel', posterController.getCheckout);

router.get('/orders', isAuth, posterController.getOrders);

router.get('/orders/:orderId', isAuth, posterController.getTicket);

module.exports = router;
