const AppError = require("../appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require('./../utils/apiFeatures');  

exports.deleteOne = Model => catchAsync(async (req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc)
    return next(new AppError('No document found with that ID',404));
    res.status(204).json({
        status:'success',
        data:null
    });
});

exports.updateOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidator:true});
    
    res.status(200).json({
        status:'success',
        data:{
            data:doc
        }
    });
});

exports.getOne = (Model,popOptions) => catchAsync( async (req,res,next) => {
    let doc = await Model.findById(req.params.id);
    if(popOptions)
    doc = await doc.populate(popOptions);

    if(!doc)
    return next(new AppError('No document found!',404));

    res.status(200).json({
        status:'success',
        data:{
        data:doc
     }
    });
});

exports.getAll = Model => catchAsync(async (req,res,next) => {
    let filter = {}
    if(req.params.tourID)
    filter = {tour:req.params.tourID};

    const features = new APIFeatures(Model.find(filter),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    const doc = await features.query;
    res.status(201).json({
      status:'success',
      results:doc.length,
      data:{
        data:doc
      }
    });
});

exports.createOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status:'success',
      data:{
        data:doc
      }
    });
  });
