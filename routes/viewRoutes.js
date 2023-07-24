const express = require('express');
const { getOverview, getTour, getLoginForm, getAccount, getSignupForm, forgotPasswordForm, myBookings } = require('./../controllers/viewController');
const { protect, isLoggedIn, } = require('./../controllers/authController');
const { createBookingCheckout } = require('./../controllers/bookingController');

const router = express.Router();


router.get('/', createBookingCheckout, isLoggedIn, getOverview)

// router.use(isLoggedIn);

router.get('/my-bookings', protect, myBookings);
router.get('/signup', getSignupForm)
router.get('/tour/:slug', protect, getTour)
router.get('/login', getLoginForm)
router.get('/me', protect, getAccount);
router.get('/forgotPasswordForm', forgotPasswordForm);


// router.post('/submit-user-data', protect, updateUserData);

module.exports = router;