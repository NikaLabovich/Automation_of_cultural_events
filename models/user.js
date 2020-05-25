const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  /*
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  },*/
  resetToken: String,
  resetTokenExpiration: Date,
  subscribes: {
    items: [
      {
        eventId: {
          type: Schema.Types.ObjectId,
          ref: 'Event',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToSubscribes = function(event) {
  const subscribesEventIndex = this.subscribes.items.findIndex(cp => {
    return cp.eventId.toString() === event._id.toString();
  });
  let newQuantity = 1;
  const updatedSubscribesItems = [...this.subscribes.items];

  if (subscribesEventIndex >= 0) {
    newQuantity = this.subscribes.items[subscribesEventIndex].quantity + 1;
    updatedSubscribesItems[subscribesEventIndex].quantity = newQuantity;
  } else {
    updatedSubscribesItems.push({
      eventId: event._id,
      quantity: newQuantity
    });
  }
  const updatedSubscribes = {
    items: updatedSubscribesItems
  };
  this.subscribes = updatedSubscribes;
  return this.save();
};

userSchema.methods.removeFromSubscribes = function(eventId) {
  const updatedSubscribesItems = this.subscribes.items.filter(item => {
    return item.eventId.toString() !== eventId.toString();
  });
  this.subscribes.items = updatedSubscribesItems;
  return this.save();
};

userSchema.methods.clearSubscribes = function() {
  this.subscribes = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, subscribes, id) {
//     this.name = username;
//     this.email = email;
//     this.subscribes = subscribes; // {items: []}
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }

//   addTosubscribes(event) {
//     const subscribeseventIndex = this.subscribes.items.findIndex(cp => {
//       return cp.eventId.toString() === event._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedsubscribesItems = [...this.subscribes.items];

//     if (subscribeseventIndex >= 0) {
//       newQuantity = this.subscribes.items[subscribeseventIndex].quantity + 1;
//       updatedsubscribesItems[subscribeseventIndex].quantity = newQuantity;
//     } else {
//       updatedsubscribesItems.push({
//         eventId: new ObjectId(event._id),
//         quantity: newQuantity
//       });
//     }
//     const updatedsubscribes = {
//       items: updatedsubscribesItems
//     };
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { subscribes: updatedsubscribes } }
//       );
//   }

//   getsubscribes() {
//     const db = getDb();
//     const eventIds = this.subscribes.items.map(i => {
//       return i.eventId;
//     });
//     return db
//       .collection('events')
//       .find({ _id: { $in: eventIds } })
//       .toArray()
//       .then(events => {
//         return events.map(p => {
//           return {
//             ...p,
//             quantity: this.subscribes.items.find(i => {
//               return i.eventId.toString() === p._id.toString();
//             }).quantity
//           };
//         });
//       });
//   }

//   deleteItemFromsubscribes(eventId) {
//     const updatedsubscribesItems = this.subscribes.items.filter(item => {
//       return item.eventId.toString() !== eventId.toString();
//     });
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { subscribes: { items: updatedsubscribesItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getsubscribes()
//       .then(events => {
//         const order = {
//           items: events,
//           user: {
//             _id: new ObjectId(this._id),
//             name: this.name
//           }
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       .then(result => {
//         this.subscribes = { items: [] };
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { subscribes: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': new ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .findOne({ _id: new ObjectId(userId) })
//       .then(user => {
//         console.log(user);
//         return user;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }

// module.exports = User;
