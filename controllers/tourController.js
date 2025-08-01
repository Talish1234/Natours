const Tour = require('../models/tourmodel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../appError');
const handlerFactory = require('./../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const upload = multer({Storage:multerStorage});

exports.uploadTourImage = upload.fields([{
  name:'imageCover',
  maxCount:1
},{
  name:'images',
  maxCount:3
}]);

exports.resizeTourImages = async (req,res,next) => {
  if(!req.files.imageCover || !req.files.images)
  return next();

  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${imageCoverFilename}`);
  req.body.imageCover = imageCoverFilename;
  req.body.images = [];
  await Promise.all(req.files.images.map(async (file,i) => {
    const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

  await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${filename}`);
  req.body.images.push(filename);
  }));
next();
}

exports.aliasTopTours = (req,res,next) => {
req.query.limit='5';
req.query.sort='-ratingsAverage,price';
req.query.fields='name,price,ratingsAverage,summery,difficulty';
next();
};

exports.getTourStatus = catchAsync(async (req,res,next)=>{
    const status = await Tour.aggregate([{
      $match:{ratingsAverage:{$gte:4.5}}
    },
    {
      $group:{
        _id:{$toUpper:'$difficulty'},
        numTours:{$sum:1},
        numRatings:{$avg:'$ratingsQuantity'},
        avgRatings:{$avg:'$ratingsAverage'},
        avgPrice:{$avg:'$price'},
        minPrice:{$min:'$price'},
        maxPrice:{$max:'$price'}
      }
    },
    {
      $sort:{avgPrice:1}
    },
    {
      $match:{_id:{$ne:'EASY'}}
    }
    ]);
    res.status(201).json({
      status:'success',
      data:{
        tour:status
      }
    });
});

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
const year = req.params.year*1;
const plan = await Tour.aggregate([
{
  $unwind:'$startDates'
},
{
  $match:{
    startDates:{
      $gte:new Data('${year}-01-01'),
      $lte:new Data('${year}-12-31')
    }
  }
},
{
  $group:{
    _id:{$month:'$_id'},
    numTourStarts:{$sum:1},
    tours:{$push:'$name'}
  }
},
{
  $addFields:{month:'_id'}
},
{
  $project:{
    _id:0
  }
},
{
  $sort:{numTourStarts:-1}
},
{
  $limit:6
}
]);
res.status(201).json({
  status:'success',
  data:{
    plan
  }
});
});

exports.getToursWithin = catchAsync(async (req,res,next) => {
  const {distance,latlng,unit} = req.params;
  const {lat,lng} = latlng.split(',');
  const radius = unit === 'mi'?distance/3963.2:distance/6378.1;
  if(!lat || !lng)
  next(new appError('Please provide latitute and longitude in the format lat,lng',400));

  const tour = await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});

  res.status(200).json({
    status:'success',
    result:tour.length,
    data:{
      data:tour
    }
  });
});

exports.getDistance = catchAsync(async (req,res,next) => {
  const {latlng,unit} = req.params;
  const {lat,lng} = latlng.split(',');
  const multiplier = unit === 'mi'?0.000621371:0.001;
  if(!lat || !lng)
  next(new appError('Please provide latitute and longitude in the format lat,lng',400));

  const distance = await Tour.aggregate([
    {
      $geoNear:{
        near:{
          type:'Point',
          coordinates:[lng*1,lat*1]
        },
        distanceField:'distance',
        distanceMultiplier:multiplier
      }
    },
    {$project:{distance:1,name:1}}
  ]);
  res.status(200).json({
    status:'success',
    result:tour.length,
    data:{
      data:tour
    }
  });
});
exports.createTours = handlerFactory.createOne(Tour);
exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTours = handlerFactory.getOne(Tour,{path:'reviews'});
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);