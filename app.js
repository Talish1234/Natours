const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./Routers/tourRouter');
const userRouter = require('./Routers/userRouter');
const reviewRouter = require('./Routers/reviewRouter');
const viewRouter = require('./Routers/viewRouter');
const bookingRouter = require('./Routers/bookingRouter');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const AppError = require('./appError');
const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requests from this IP,try again in an hours!'
});
/*
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", 'data:', 'blob:','js.stripe.com'],

    fontSrc: ["'self'", 'https:', 'data:'],

    scriptSrc: ["'self'", 'unsafe-inline'],

    scriptSrc: ["'self'", 'https://*.cloudflare.com'],

    scriptSrcElem: ["'self'",'https:', 'https://*.cloudflare.com'],

    styleSrc: ["'self'", 'https:', 'unsafe-inline'],

    connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
    
      imgSrc: [ "'self'", "data:" ],
      scriptSrc: [ "'self'", "js.stripe.com" ]
  },
}));*/
app.use(express.json());
app.use(express.urlencoded({extended:true,limit:'10kb'}));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());
//app.use(xss());
app.use(hpp({
  whiteList:['duration']
}));
app.use(cookieParser());
// 3) ROUTES

app.use(compression());
app.use('/',viewRouter);
app.use('/api',limiter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking',bookingRouter);
app.all('*', (req, res, next) =>{
  res.status(404).render('error',{
    msg:'Page not found :('
  })
});

module.exports = app;
