const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'user should have name']
    },
    email:{
        type:String,
        unique:[true,'email all ready exist'],
        required:[true,'email required'],
        validate:[validator.isEmail,'provide a valid email'],
        lowercase:true
    },
    photo:{
        type:String,
        default:'no_profile.png'
    },
    password:{
        type:String,
        require:[true,'password required'],
        min:[8,'minimun length of password must be 8'],
        select:false
    },
    confirmPassword:{
        type:String,
        require:[true,'password required'],
        validate:{
        validator:function(password){
            return password === this.password;
        },
        message:'confirm password and password are not same'
    }
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    passwordChangedAt:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save',async function(next) {
 //if(!this.isModified('password'))
 //return next();
 if(!this.isModified('password'))
 return next();
 this.password = await bcrypt.hash(this.password,12);
 confirmPassword = undefined;
 next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password'))
    return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre('/^find/',function(next){
    this.find({active:{$ne:false}});
    next();
})

userSchema.methods.corretPassword = async function(candidatepassword,userpassword) {
    return await bcrypt.compare(candidatepassword,userpassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
    return JWTTimeStamp < changedTimeStamp;
}
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10*60*1000;
    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;