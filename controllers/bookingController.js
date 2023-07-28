const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2. Create checkout session

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-bookings/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
    // success_url: `${req.protocol}://${req.get('host')}/my-bookings`,  THIS IS FOR AFTER DEPLOYING
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://www.natours.dev/img/tours/${tour.imageCover}`,
              `https://www.natours.dev/img/tours/${tour.images[0]}`
            ],
          },
        },
      },
    ]
  });

  // 3. Create seesion as response
  res.status(200).json({
    status: "success",
    session
  })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is temporary, because it is very much unsafe. Later we will use Stripe web hooks to create the successfull bookings...
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);


})

// ##########################################################################################################################################
// Stripe Integration with Its "WEB HOOKS" to get and use the booking details more and more securely ########################################W

// const createBookingCheckoutViaWebhook = async (session) => {

//   const tour = session.client_reference_id;
//   const user = (await User.findOne({ email: session.customer_email })).id;
//   const price = session.line_items[0].price_data.unit_amount / 100;

//   await Booking.create({ tour, user, price });
// }

// -----------------------------------------------------------------------------------------------------

// exports.webhookCheckout = (req, res, next) => {
//   const signature = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET);

//   } catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   if (event.type === 'checkout.sesssion.completed') createBookingCheckoutViaWebhook(event.data.object);
//   res.status(200).json({ recieved: true });
// }