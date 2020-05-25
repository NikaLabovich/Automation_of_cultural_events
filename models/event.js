const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Event', eventSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class event {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the event
//       dbOp = db
//         .collection('events')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('events').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('events')
//       .find()
//       .toArray()
//       .then(events => {
//         console.log(events);
//         return events;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static findById(evenId) {
//     const db = getDb();
//     return db
//       .collection('events')
//       .find({ _id: new mongodb.ObjectId(evenId) })
//       .next()
//       .then(event => {
//         console.log(event);
//         return event;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static deleteById(evenId) {
//     const db = getDb();
//     return db
//       .collection('events')
//       .deleteOne({ _id: new mongodb.ObjectId(evenId) })
//       .then(result => {
//         console.log('Deleted');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }

// module.exports = event;
