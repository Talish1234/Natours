const sharp = require("sharp");
const appError = require("../appError");
const User = require("../models/usermodel");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require('./../controllers/handlerFactory');
const multer = require('multer');
/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/users');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
*/
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto =catchAsync( async (req,res,next) => {
  if(!req.file)
  return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj,...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el))
    newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateme = catchAsync( async (req,res,next) => {
  if(req.body.password || req.body.confirmPassword)
  return next(new appError('This route is not for Password update, please use /updatePassword',400));
  
  const filteredBody = filterObj(req.body,'name','email');
  if(req.file)
  filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
    runValidators:true
  });

  res.status(200).json({
    status:'success'
  });
});

exports.deleteMe = catchAsync(async (req,res,next) => {
  await User.findByIdAndUpdate(req.user.id,{active:false});

  res.status(204).json({
    status:'success',
    data:null
  });
});


exports.getme = (req,res,next) => {
  req.params.id = req.user.id;
  next();
}

  exports.createUser = handlerFactory.createOne(User);
  exports.getAllUsers = handlerFactory.getAll(User);
  exports.getUser = handlerFactory.getOne(User);
  exports.updateUser = handlerFactory.updateOne(User);
  exports.deleteUser = handlerFactory.deleteOne(User);
  