const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
let SALT = 10
const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: 1,
        trim: true
    },
password:{
    type: String,
    required: true,
    minLength: 6
 }
});

userSchema.pre('save', function(next){
    var user = this
    if(user.isModified('password')){
        bcrypt.genSalt(SALT , function(err , salt){
            if(err) return next(err);

            bcrypt.hash(user.password , salt , function(err , hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
        })
    }else {
        next()
    }
})

userSchema.methods.comparePassword = function(candidatePassword , checkpassword){
    bcrypt.compare(candidatePassword , this.password , function(err , isMatch){
        if(err) return checkpassword(err)
        checkpassword(null , isMatch)
        
    })
}

const User = mongoose.model('User' , userSchema);
module.exports = { User }