const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const stripe = require('stripe')(process.env.STRIPESECRETKEY);
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./../controllers/handlerFactory');
const Tour = require('./../models/tourmodel');
const Booking = require('./../models/bookingmodel');
exports.getCheckoutSession = catchAsync( async (req,res,next) => {
    const tour = await Tour.findById(req.params.tourId);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email:req.user.email,
        client_reference_id:req.params.tourId,
        line_items: [{
          price_data: {
          currency: 'inr',
          unit_amount: tour.price*4000,

          product_data: {
             name: `${tour.name} Tour`,
             description: tour.summary,
             images: ['https://media.istockphoto.com/id/607280514/photo/lupins-of-lake-tekapo.webp?s=1024x1024&w=is&k=20&c=A3ltpdSegsVxqQgcce9WwZRZkkoP3b4eBn-KLv6Di-E='],
      },
    },quantity: 1,
  }],
        mode:'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price*40}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`
    });

    res.status(200).json({
        status:'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req,res,next) => {
  const {tour,user,price} = req.query;

  if(!tour && !user && !price)
  return next();

  await Booking.create({tour,user,price});
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = handlerFactory.createOne(Booking);
exports.getAllBooking = handlerFactory.getAll(Booking);
exports.getBooking = handlerFactory.getOne(Booking);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);