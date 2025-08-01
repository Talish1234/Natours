const mongoose = require('mongoose');
const Tour = require('./../models/tourmodel');

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review can not be empty!']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'Review must belong to a tour.']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must belong to a user']
    }
},
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    });

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name photo'
    })
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
      { $match: { tour: tourId } },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity: stats[0].nRating,
      });
    }
  };
  
  reviewSchema.index({tour:1,user:1},{unique:true});

  reviewSchema.post('save', async function () {
    await this.model('Review').calcAverageRatings(this.tour);
  });
/*
  reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r = await this.findOne();
    next();
  });

  reviewSchema.post(/^findOneAnd/,async function(){
    await this.r.model('Review').calcAverageRatings(this.r.tour);
  });
  */
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;