const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const validator = require('validator');

// CREATING TOUR SCHEMA

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxLength: [40, 'Name should have maximum length of 40 characters'],
    minLength: [10, 'Name should have minimum length of 10 characters'],
  },
  slug: String,
  secret_tour: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty should be either easy, medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating should be above 1.0'],
    max: [5, 'Rating should be below 5.0'],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      // This works only for current document: only when new document is created, not while updating a document
      validator: function (val) {
        return val < this.price;
      },
      message: "Price discount ({VALUE}) should be less than price of tour"
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a image cover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    description: String,
    address: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      description: String,
      address: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Indexes to improve read performances---
tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL FUNCTION
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
})

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

// DOCUMENT MIDDLEWARE (MONGOOSE): ONLY WORK FOR .save() and .create() Note: not work in update(patch and put-)

// pre
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
})

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async el => await User.findById(el));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// })

// // post
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);

//   next();
// })


// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secret_tour: { $ne: true } })

  this.start = Date.now();

  next();
})

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
})

// tourSchema.pre('findOne', function (next) {
//   this.find({ secret_tour: { $ne: true } })

//   next();
// })

tourSchema.post('find', function (docs, next) {
  console.log(`Query taked ${Date.now() - this.start} milliseconds!`);

  next();
})


// AGGREGATION MIDDLEWARE

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret_tour: { $ne: true } } });

//   next();
// })

// CREATING TOUR MODEL

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
