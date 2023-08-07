const crypto = require('crypto');
const util = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
// const sendEmail = require('./../utils/email');
const Email = require('./../utils/email');


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


const signToken = id => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, { expiresIn: "90d" })
}

const createSendToken = (user, statusCode, res, req) => {
  const token = signToken(user._id);
  const cookieOptions = {
    // expires: new Date(Date.now() + `${process.env.JWT_COOKIE_EXPIRES_IN}` * 24 * 60 * 60 * 1000),
    expires: "1d",
    httpOnly: true,
    secure: req.secure
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user
  })
}

exports.signUp = catchAsync(async (req, res, next) => {

  const user = await User.create(req.body);

  // const url = `${ req.protocol }://${req.get('host')}/me`
  // new Email(req.body, url).sendWelcome();

  createSendToken(user, 201, res, req);
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check password and email are entered by the user
  if (!email || !password) {
    return next(new AppError('Please provide the email and password correctly', 400));
  }

  // 2. Check if these credentials exist in our DataBase
  const user = await User.findOne({ email }).select('+password');
  if (user === null) return next(new AppError("User does not exist", 401));

  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Wrong email or password', 401));
  }

  // 3. If OK, then provide the JSON web token

  createSendToken(user, 200, res, req);
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Extracting token from the request's header, if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in, log in to get access'))
  }
  // 2. Verification of the token
  const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) return next(new AppError("User belonging to this token does no longer exist", 401));

  // 4. Check if the user has changed the password, after the issuence of the token
  if (freshUser.passwordChangedAt) {
    if (parseInt(freshUser.passwordChangedAt.getTime() / 1000, 10) > decoded.iat) {
      return next(new AppError('User has changed the password, please login again', 401));
    }
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
})


// Only for rendering pages, no errors
exports.isLoggedIn = async (req, res, next) => {

  try {
    if (req.cookies.jwt) {

      // 1. Verification of the token
      const decoded = await util.promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2. Check if user still exist
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) return next();

      // 3. Check if the user has changed the password, after the issuence of the token
      if (freshUser.passwordChangedAt) {
        if (parseInt(freshUser.passwordChangedAt.getTime() / 1000, 10) > decoded.iat) {
          return next();
        }
      }

      // 4. i.e. someone has logged in
      res.locals.user = freshUser;
    }
  } catch (err) {
    return next();
  }
  next();
}

exports.loggingOut = (req, res, next) => {

  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: "success"
  })
}

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have the permission for this action', 403));
    }

    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the email query
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('No user found with this email', 404));

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. send token to the user's email

  // const message = `Forgot your password ? Submit a PATCH request with your new password and password confirm to: ${resetURL}.\nPlease ignore this if didn't forgot the password`;
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    new Email(user, resetURL).resetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Email sent to the user'
    })
  } catch (err) {
    user.passwordResetToken = undefined,
      user.passwordResetExpires = undefined,
      await user.save({ validateBeforeSave: false });

    return next(new AppError('There is an error sending the link to the email', 500));
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {

  // 1. Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  // 2. If token is not expired and there is user then set the new password
  if (!user) return next(new AppError('Invalid token or expired, do it again', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update the changePasswordAt property for the user
  // updated in userModel.js

  // 4. Log the user in, send new JWT
  createSendToken(user, 200, res, req);
})


exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user from the collection
  const user = await User.findById(req.user._id).select('+password');

  // 2. Check if POSTed currentpassword is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Wrong password entered', 401));
  }

  // 3. If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log user in, send new JWT
  createSendToken(user, 200, res, req);
})
