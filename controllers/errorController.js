const util = require('util');
const jwt = require('jsonwebtoken');
const { decode } = require('jsonwebtoken');
const AppError = require('./../utils/appError')
const User = require('./../models/userModel');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue;
  const message = `Duplicate field value: ${err.keyValue.email ? value.email : value.name}, please use another value for this`;

  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const message = Object.values(err.errors).map(el => el.message).join('. ');

  return new AppError(message, 400);
}

const handleJWTError = () => new AppError("Invalid token, please login again", 401);
const handleTokenExpiredError = () => new AppError("Token expired, Please login again", 401);

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

const sendErrorDev = (req, res, err) => {
  // A. For API Version
  if (req.originalUrl.startsWith('/api')) {

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    })
  }

  // B. For WEBSITE Version
  return res.status(err.statusCode).render('error', {
    title: "something went wrong",
    msg: err.message
  })
};

const sendErrorProd = (req, res, err, user) => {
  // A. For API
  //Operational error: trusted error
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }

    // Unknown error: may come from mongoose or npm, etc. 
    res.status(500).json({
      status: 'Error',
      message: err.message
    })
  }

  // B. Rendering error on website
  //Operational error: trusted error
  if (user) {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: "Something went wrong",
        msg: err.message,
        user
      })
    }

    // Unknown error: may come from mongoose or npm, etc. 
    return res.status(500).render('error', {
      title: 'Error happened',
      msg: "Something went wrong",
      user
    })
  }
  else {
    //Operational error: trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: "Something went wrong",
        msg: err.message
      })
    }

    // Unknown error: may come from mongoose or npm, etc. 
    return res.status(500).render('error', {
      title: 'Error happened',
      msg: "Something went wrong"
    })
  }
};


module.exports = async (err, req, res, next) => {
  let user;
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(req, res, err);
  }

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    // 1. Check if user has logged in, so that to provide user details also while rendering the error page, by which it will show logout btn in header, i.e. user has logged in
    if (req.cookies.jwt) {
      const decoded = await util.promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      if (decoded.id) user = await User.findById(decoded.id);
    }


    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError();

    if (user) return sendErrorProd(req, res, error, user);
    return sendErrorProd(req, res, error);
  }
}