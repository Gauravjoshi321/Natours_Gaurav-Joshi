const express = require('express');

const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto } = require('./../controllers/userController');
const { signUp, login, loggingOut, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = require('./../controllers/authController');

const router = express.Router();

// USER RESOURCE ROUTING
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', loggingOut);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes below from this middlewares
router.use(protect);

router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/me', getMe, getUser)

router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;