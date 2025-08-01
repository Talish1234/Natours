const Review = require('../models/reviewmodel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./../controllers/handlerFactory');

exports.setTourUserIds = (req,res,next) => {
    if(!req.body.tour)
    req.body.tour = req.params.tourId;
    
    if(!req.body.user)
    req.body.user = req.user.id;
    
    next();
};
exports.createReview = catchAsync(async (req,res,next) => {
    const newReview = await Review.create(req.body);
    res.json({
        status:'Success',
        data:{
            review:newReview
        }
    });
});

exports.getAllReview = handlerFactory.getAll(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);
exports.getReview = handlerFactory.getOne(Review);