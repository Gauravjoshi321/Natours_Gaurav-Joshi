const express = require('express');
const { protect, restrictTo } = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const { createTour, getAllTours, getTour, updateTour, deleteTour, aliasTopTours, getTourStats, getMonthlyPlan, getToursWithin, calculateDistances, uploadTourImages, resizeTourImages } = require('./../controllers/tourController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// TOUR RESOURCE ROUTING
router.get('/monthly-plan/:year', protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.get('/tour-stats', getTourStats);
router.get('/top-5-cheap', aliasTopTours, getAllTours);

router.route('/tours-within/:distance/centre/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(calculateDistances);


router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(protect, getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);


module.exports = router;