const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour']
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
})

// Mongoose middleware
// bookingSchema.pre(/^find/, function (next) {
//   this
//     .populate('user')
//     .populate('tour');

//   next();
// })


// Booking Model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;