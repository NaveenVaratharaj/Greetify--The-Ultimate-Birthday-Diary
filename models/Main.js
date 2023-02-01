const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require("passport")
const LocalStrategy = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose")

// Connecting to the DB
mongoose.connect("mongodb://localhost:27017/birthdayPlanner",  { useUnifiedTopology:true});


// Creation of schema
const userSchema = new mongoose.Schema({ 
    email: {
        type: String
    }, 
    password: {
        type: String
    },
    birthdays:[
        {
            person_name: String,
            date: Date,
            relType: String
        }
    ]
});

userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

const userModel = mongoose.model('user',userSchema)
 
module.exports = userModel
