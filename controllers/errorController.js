const AppError = require('./../appError');

const sendErrorDev = (err,req,res) => {
  if( req.originalUrl.startWith('/api')){
    res.status(err.statusCode).json({
      status:err.status,
      error:err,
      message:err.message,
      stack:err.stack
    });}else{
      res.status(err.statusCode).render('error',{
        title:'Something went worng!',
        msg:err.message
      })
    }
};

const sendErrorProd = (err,req,res) => {
  if(err.isOperational){
    res.status(err.statusCode).json({
      status:err.status,
      message:err.message,
  });
  }else{
    console.error('Error',err);
    res.status(500).json({
      status:'error',
      message:'somthing went wrong'
    });
  }
};

const handleCastErrorDB = err => {
  const message = `invalid ${err.path}:${err.value}`;
 return new AppError(message,400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/([""])(\\?.)*?\\/)[0];
  const message = `Duplicate field value:${value} please use another value`;
  return new AppError(message,400);
};

const handleValidationErrorDB = err => {
  const errors = object.value(err.errors).map(el => el.message);
  const message = `Invalide input data. ${errors.join('. ')}`;

  return new AppError(message,400);
};

module.exports = ((err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
   
    if(process.env.NODE_ENV === 'production'){
      let error = {...err};

      if(error.name === 'CastError')
       error = handleCastErrorDB(error);

      if(error.code === 11000)
       error = handleDuplicateFieldsDB(error); 
      
      if(err.name === 'ValidationError')
       error = handleValidationErrorDB(error);

       sendErrorProd(error,req,res);

    }else if(process.env.NODE_ENV === 'development'){
       sendErrorDev(err,req,res);
  }
  });