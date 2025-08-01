const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

router.use(authController.protect)
router.get('/checkout-session/:tourId',bookingController.getCheckoutSession)

router
.route('/')
.get(bookingController.getAllBooking)
.post(bookingController.createBooking);

router
.route('/:id')
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking);

module.exports = router;