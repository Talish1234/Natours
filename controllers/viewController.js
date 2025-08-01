const AppError = require('../appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourmodel');
const User = require('./../models/usermodel');
const Booking = require('./../models/bookingmodel');
const Review = require('./../models/reviewmodel');
const { locales } = require('validator/lib/isAlpha');

exports.getOverview = catchAsync(async (req,res,next) => {
    const tours = await Tour.find();
    res.status(200).render('overview',{
    title:'All Tours',
    tours
    });
  });

exports.getTour = catchAsync(async (req,res,next) => {
    const tour = await Tour.findOne({slug:req.params.slug}).populate({
      path:'reviews',
      fields:'review rating user'
    });
    
    if(!tour)
    return next(new AppError('There is no tour with that name', 404));
    res.status(200).render('tour',{
      title: tour.name,
      tour
    });
});

exports.getLoginForm = catchAsync(async (req,res) => {
    res.status(200).render('login',{
      title: 'Login '
    });
});

exports.getSignUpForm = catchAsync(async (req,res) => {
  res.status(200).render('signup',{
    title: 'Sign Up '
  });
});

exports.getAccount = (req,res) => {
  res.status(200).render('account',{
    title: 'Your account'
  });  
}

exports.updateUserData = catchAsync(async (req,res,next) => {
  const updateUser = await User.findByIdAndUpdate(req.user._id,{name:req.body.name,email:req.body.email},{new:true,runValidators:true});
  res.status(200).render('account',{
    title:'Your account',
    user:updateUser
  });
});

exports.getMyTours = catchAsync(async (req,res,next) => {
  const bookings = await  Booking.find({user:req.user.id});
  const tourId = bookings.map(el => el.tour);
  const tours = await Tour.find({_id:{$in:tourId}});

  res.status(200).render('overview',{
    title:'My Tour',
    tours
  });
});

exports.getMyReviews = catchAsync(async (req,res,next) => {
  const reviews = await  Review.find({user:req.user.id});
  res.status(200).render('myReview',{
    title:'My Review',
    reviews
  });
});