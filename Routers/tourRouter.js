const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const router = express.Router();

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours);

router
.route('/tour-status')
.get(tourController.getTourStatus);

router
.route('/monthly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guid','guide'),tourController.getMonthlyPlan);

router
.route('/')
.get(tourController.getAllTours )
.post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTours);

router
.route('/:id')
.get(tourController.getTours)
.patch(authController.protect,authController.restrictTo('admin','lead-guid'),tourController.uploadTourImage,tourController.resizeTourImages,tourController.updateTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guid'),tourController.deleteTour);

router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);

router
.route('/distance/:latlng/unit/:unit')
.get(tourController.getDistance);

router
.route('/:tourID/reviews')
.post(authController.protect,authController.restrictTo('user'),reviewController.createReview);

module.exports = router;