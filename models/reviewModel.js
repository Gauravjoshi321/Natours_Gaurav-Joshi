const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  })

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Mongoose query middleware
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })

  this.populate({
    path: 'user',
    select: 'name photo'
  })

  next();
})

reviewSchema.statics.calcRatingsAvg = async function (tourId) {
  // Here the "this" keyword points to the Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating
    })
  }
  else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.7
    })
  }
}

reviewSchema.post('save', function () {
  // Here "this" keyword points to the current document only
  this.constructor.calcRatingsAvg(this.tour);
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  // Here we can not call the above cancRating function, because this is pre middleware, and at this time the query is not executed, so not updated in the database, so we also cannot calculate that what is updated
  next();
})

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() || this will not work here, because in post middleware, the query has been executed already

  await this.r.constructor.calcRatingsAvg(this.r.tour);
})



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;