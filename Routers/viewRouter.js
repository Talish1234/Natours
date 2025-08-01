const viewController = require('./../controllers/viewController');
const bookingController = require('./../controllers/bookingController')
const authController = require('./../controllers/authController')
const express = require('express');
const router = express.Router();


router.get('/',bookingController.createBookingCheckout,authController.isLoggedIn,viewController.getOverview);
router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour);
router.get('/login',authController.isLoggedIn,viewController.getLoginForm);
router.get('/signup',viewController.getSignUpForm);
router.get('/me',authController.protect,viewController.getAccount);
router.get('/my-tours',authController.protect,viewController.getMyTours);
router.get('/my-reviews',authController.protect,viewController.getMyReviews);
router.post('/submit-user-data',authController.protect,viewController.updateUserData)
module.exports = router;