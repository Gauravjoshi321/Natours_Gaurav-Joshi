// 3rd-party modules
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const hpp = require('hpp');
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const { webhookCheckout } = require('./controllers/bookingController');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// some defined variables
const app = express();


// Template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Global Middlewares

// Implementing cors
app.use(cors());

// Serving static files: All static assets will be served through the Public folder
app.use(express.static(path.join(__dirname, 'public')));

// 1. setting security HTTP headers
// app.use(helmet());

// 2. request info
if (process.env.NODE_ENV === "development")
  app.use(morgan('dev'));

// 3. rate-limiter
const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, Please try again later !'
})

app.use('/api', limiter);

// Implementing the stripe webhooks

// app.post(
//   '/webhook-checkout',
//   express.raw({ type: 'application/json' }),
//   webhookCheckout
// );

// 4. Body parser
// req.body parser
app.use(express.json({ limit: '10kb' }));
// HTML form request body parser: but it's a feature of express itself
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
// Browser cookie parser
app.use(cookieParser());

// 5. Data sanitization: using express-mongo-sanitize against no-sql query injection
app.use(mongoSanitize());

// 6. Data sanitization: using xss-clean against XSS
app.use(xssClean());

// 7. Preventing parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(compression());


////////////////////////////////////////
// Routes
app.use('/', viewRoutes);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can"t find ${req.originalUrl} on this server`, 404));
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);


module.exports = app;