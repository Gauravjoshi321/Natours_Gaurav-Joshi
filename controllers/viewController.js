const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');



exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get tour data from the tours collection
  const tours = await Tour.find();

  // 2. Build template
  // 3. Render that template using tour data from 1.
  res.status(200).render('overview', {
    title: "all tours",
    tours
  })
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. Get tour from the collection: and with populating reviews
  const tour = await Tour.find({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: 'review rating user '
  })

  // console.log(tour);

  if (tour.length === 0) return next(new AppError('Tour does not exist', 404));

  // 2. Build template
  // 3. Render that template using the data from 1.
  res.status(200).render('tour', {
    title: `${tour[0].name}`,
    tour: tour[0]
  })
})

exports.getSignupForm = (req, res, next) => {

  res.status(200).render('signupForm', {
    title: "Signup with your details"
  })
}

exports.getLoginForm = (req, res, next) => {

  res.status(200).render('loginForm', {
    title: "Login to your account"
  })
}

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  })
}

exports.forgotPasswordForm = (req, res, next) => {
  res.status(200).render('forgotPasswordForm', {
    title: 'forgot password'
  })
}

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const UpdatedUser = await User.findByIdAndUpdate(req.user._id, {
//     name: req.body.name,
//     email: req.body.email
//   },
//     {
//       new: true,
//       runValidators: true
//     })

//   res.status(200).render('account', {
//     title: 'Your account',
//     user: UpdatedUser
//   })
// })

exports.myBookings = catchAsync(async (req, res, next) => {
  // 1. Find all bookings of the current user
  const bookings = await Booking.find({ user: req.user._id });

  // 2. Let's populate all these tours manually now
  const bookingTourIdsArray = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: bookingTourIdsArray } });

  res.locals.bookings = "Bookings";
  // 3. Render the tour documents
  res.status(200).render('overview', {
    title: 'My Bookings',
    tours,
  })
})

