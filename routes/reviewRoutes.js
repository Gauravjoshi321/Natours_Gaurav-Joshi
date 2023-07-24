const express = require('express');

const { getAllReviews, createReview, deleteReview, setTourUserId, getReview, updateReview } = require('./../controllers/reviewController');
const { protect, restrictTo } = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserId, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;