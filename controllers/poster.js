const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_YVIC7Unv44095WcST42qiX8p007GrQTfvc');

const PDFDocument = require('pdfkit');

const Event = require('../models/event');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getEvents = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Event.find()
    .countDocuments()
    .then(numEvents => {
      totalItems = numEvents;
      return Event.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(events => {
      res.render('poster/event-list', {
        evens: events,
        pageTitle: 'events',
        path: '/events',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEvent = (req, res, next) => {
  const evenId = req.params.eventId;
  Event.findById(evenId)
    .then(event => {
      res.render('poster/event-detail', {
        event: event,
        pageTitle: event.title,
        path: '/events'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Event.find()
    .countDocuments()
    .then(numEvents => {
      totalItems = numEvents;
      return Event.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(events => {
      res.render('poster/index', {
        evens: events,
        pageTitle: 'poster',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSubscribes = (req, res, next) => {
  req.user
    .populate('subscribes.items.eventId')
    .execPopulate()
    .then(user => {
      const events = user.subscribes.items;
      res.render('poster/subscribes', {
        path: '/subscribes',
        pageTitle: 'Your subscribes',
        events: events
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSubscribes = (req, res, next) => {
  const evenId = req.body.eventId;
  Event.findById(evenId)
    .then(event => {
      return req.user.addToSubscribes(event);
    })
    .then(result => {
      console.log(result);
      res.redirect('/subscribes');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSubscribesDeleteEvent = (req, res, next) => {
  const evenId = req.body.eventId;
  req.user
    .removeFromSubscribes(evenId)
    .then(result => {
      res.redirect('/subscribes');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let events;
  let total = 0;
  req.user
    .populate('subscribes.items.eventId')
    .execPopulate()
    .then(user => {
      events = user.subscribes.items;
      total = 0;
      events.forEach(p => {
        total += p.quantity * p.eventId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: events.map(p => {
          return {
            name: p.eventId.title,
            description: p.eventId.description,
            amount: p.eventId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', 
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    })
    .then(session => {
      res.render('poster/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        events: events,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('subscribes.items.eventId')
    .execPopulate()
    .then(user => {
      const events = user.subscribes.items.map(i => {
        return { quantity: i.quantity, event: { ...i.eventId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        events: events
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearSubscribes();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('subscribes.items.eventId')
    .execPopulate()
    .then(user => {
      const events = user.subscribes.items.map(i => {
        return { quantity: i.quantity, event: { ...i.eventId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        events: events
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearSubscribes();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('poster/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getTicket = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const ticketName = 'ticket-' + orderId + '.pdf';
      const ticketPath = path.join('data', 'tickets', ticketName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + ticketName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(ticketPath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text('Your ticket', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.events.forEach(even => {
        totalPrice += even.quantity * even.event.price;
        pdfDoc.fontSize(20).text(even.event.title);
        pdfDoc.fontSize(14).text(even.event.discrption);
        pdfDoc.text('-----------------------');
        pdfDoc
          .fontSize(14)
          .text(
            'Total Price: ' +
              even.quantity +
              ' x ' +
              even.event.price +
              ' = ' +
              totalPrice  +
              '$'
          );
      });
      pdfDoc.text('-----------------------');
      pdfDoc.fontSize(14).text('Date of purchase');
      pdfDoc.fontSize(12).text('26.05.2020');
      pdfDoc.end();
      
    })
    .catch(err => next(err));
};
