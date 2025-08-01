const User = require('./../models/usermodel');
const Email = require('./../utils/email')
const catchAsync = require('./../utils/catchAsync'); 
const util = require('util');
const appError = require('./../appError');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { compareSync } = require('bcrypt');

const signToken = id => {
     return jwt.sign({id},process.env.JWTSECRET,{expiresIn:process.env.JWTEXPIRESIN*24*60*60*1000});
};

const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires:new Date(Date.now() + process.env.JWTCOOKIEEXPIRESIN*24*60*60*1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV === 'Production')
    cookieOptions.secure = true;

    res.cookie('jwt',token,cookieOptions);
    user.password = undefined;
    
    res.status(statusCode).json({
        status:'success',
        token,
        data:{user}
    });
};

exports.signin = async (req,res,next) => {
    try{
const newUser = await User.create({
    email:req.body.email,
    name:req.body.name,
    password:req.body.password,
    confirmPassword:req.body.passwordConfirm
});
const url = `${req.protocol}://${req.get('host')}/me`;
await new Email(newUser,url).sendWelcome();
    createSendToken (newUser,201,res);}
    catch(err){
        console.log(err);
    }
};

exports.login = catchAsync(async (req,res,next) => {
    const {email,password} = req.body;
    if(!email || !password)
    return next(new appError('please provide email and password'));

    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.corretPassword(password,user.password)))
    return next(new appError('Incorret email or password'));

    createSendToken(user,201,res);
});

exports.logout = (req,res,next) => {
    res.cookie('jwt','logout',{
        expires: new Date(new Date().getTime()),
        httpOnly:true
    });
    res.status(200).json({
        status:'success'
    });
}
exports.protect = catchAsync(async (req,res,next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
    else if(req.cookies.jwt)
    token = req.cookies.jwt;

    if(!token)
    return next(new appError('You are not logged in! Please log in to get access',401));

    const decode = await (jwt.verify(token, process.env.JWTSECRET));
    const currentUser =  await User.findById(decode.id);
    if(!currentUser)
    return next(new appError('The user belonging to this token does no longer exist',401));

    if(currentUser.changedPasswordAfter(decode.iat))
        return next(new appError('User recently  changed password! please log in again',401));
        req.user = currentUser;
        res.locals.user = currentUser;
    next();
});

exports.isLoggedIn = catchAsync(async (req,res,next) => {

    if(req.cookies.jwt){
        const decode =await jwt.verify(req.cookies.jwt, process.env.JWTSECRET)
    
    const currentUser =  await User.findById(decode.id);

    if(!currentUser)
    return next();

    if(currentUser.changedPasswordAfter(decode.iat))
        return next();
        res.locals.user = currentUser;
       return next();
    }
    next();
});

exports.restrictTo = (...roles) =>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        return next(new appError('You do not have permission to perform this action',403));
        next();
    }
};

exports.forgetPassword = catchAsync( async (req,res,next)=>{
    
    //find the user 
    const user = await User.findOne({email:req.body.email});
    
    //check the user 
    if(!user)
    return next(new appError('There is  no user with email address',404));
    //create reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //Send it to user email 
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    try{
       await new Email(user,resetURL).sendPasswordReset();
            
        res.status(200).json({
            status:'success',
            message:'token sent to email!'
        });
    }catch(err){
        user.passwordResetToken = undefined;
        user.createPasswordResetExpires = undefined;
        await user.save({validateBeforeSave:false});
        return next(new appError('There was an error sending the email.Try again later!'),500);
    }
});

exports.resetPassword = catchAsync(async (req,res,next) =>{
    
    const hashedToken  = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({passwordResetToken:hashedToken});

    if(!user)
    return next(new appError('Token is invalid or has expired',400));

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.createPasswordResetExpires = undefined;
    user.save();

    createSendToken(user,200,res);

});

exports.updatePassword = catchAsync (async (req,res,next) => {

    const user = await User.findById(req.user._id).select('+password');
    if(!(await user.corretPassword(req.body.currentPassword,user.password)))
    return next(new appError('Your current password is wrong',401));

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    createSendToken(user,200,res);
});