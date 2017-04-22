var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
//var bcrypt = require('bcryptjs');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            minlength: 2,
            trim: true,
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: "{VALUE} is not a valid E-Mail"
            }
        },

        password: {
            type: String,
            required: true
        },
        tokens: [
            {
                access: {
                    type: String,
                    required: true
                },
                token: {
                    type: String,
                    required: true
                }
            }
        ],
        archives: [
          {
            classname: {
              type: String
            },
            teacher: {
              type: String //email of teacher
            },
            answers: [],
            score: {
              type: Number
            },
            total: {
              type: Number //number of questions asked
            }
          }
        ]
    });

//User creation methods/statics

UserSchema.pre('save', function(next){
    var user = this;
    var salt = bcrypt.genSaltSync(10);
    if (user.isModified('password')) {
        var userPassword = user.password;
        var hash = bcrypt.hashSync(userPassword, salt);
        user.password = hash;
        next();
    } else {
        next();
    }
});

//User login/other methods & statics

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    user.tokens.push({access, token});
    return user.save().then(() => {
        return token
    });
};

UserSchema.statics.findByCredentials = function (email, password) {
      var User = this;
      return User.findOne({email: email}).then((user) => {
          if (!user) {
              return Promise.reject();
          }
            var checkPass = bcrypt.compareSync(password, user.password);
            console.log(checkPass)
            if(checkPass){
              return Promise.resolve(user);
            }
            return Promise.reject();
      });
};

//Export user (db prop)
    var User = mongoose.model('Student', UserSchema);

    module.exports = User;
