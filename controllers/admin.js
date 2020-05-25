const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Event = require('../models/event');

exports.getAddEvent = (req, res, next) => {
  res.render('admin/edit-event', {
    pageTitle: 'Add event',
    path: '/admin/add-event',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddEvent = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render('admin/edit-event', {
      pageTitle: 'Add event',
      path: '/admin/add-event',
      editing: false,
      hasError: true,
      event: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-event', {
      pageTitle: 'Add event',
      path: '/admin/add-event',
      editing: false,
      hasError: true,
      event: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const event = new Event({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  event
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created event');
      res.redirect('/admin/events');
    })
    .catch(err => {
      // return res.status(500).render('admin/edit-event', {
      //   pageTitle: 'Add event',
      //   path: '/admin/add-event',
      //   editing: false,
      //   hasError: true,
      //   event: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description
      //   },
      //   errorMessage: 'Database operation failed, please try again.',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditEvent = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const evenId = req.params.eventId;
  Event.findById(evenId)
    .then(event => {
      if (!event) {
        return res.redirect('/');
      }
      res.render('admin/edit-event', {
        pageTitle: 'Edit event',
        path: '/admin/edit-event',
        editing: editMode,
        event: event,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditEvent = (req, res, next) => {
  const evenId = req.body.eventId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-event', {
      pageTitle: 'Edit event',
      path: '/admin/edit-event',
      editing: true,
      hasError: true,
      event: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: evenId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Event.findById(evenId)
    .then(event => {
      if (event.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      event.title = updatedTitle;
      event.price = updatedPrice;
      event.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(event.imageUrl);
        event.imageUrl = image.path;
      }
      return event.save().then(result => {
        console.log('UPDATED event!');
        res.redirect('/admin/events');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEvents = (req, res, next) => {
  Event.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(events => {
      console.log(events);
      res.render('admin/events', {
        evens: events,
        pageTitle: 'Admin events',
        path: '/admin/events'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteEvent = (req, res, next) => {
  const evenId = req.params.eventId;
  Event.findById(evenId)
    .then(event => {
      if (!event) {
        return next(new Error('event not found.'));
      }
      fileHelper.deleteFile(event.imageUrl);
      return Event.deleteOne({ _id: evenId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED event');
      res.status(200).json({ message: 'Success!' });
    })
    .catch(err => {
      res.status(500).json({ message: 'Deleting event failed.' });
    });
};
