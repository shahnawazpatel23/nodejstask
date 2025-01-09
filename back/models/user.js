const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      minlength: 3
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    },
    password: { 
      type: String, 
      required: true,
      minlength: 8
    },
    resetToken: String,
    resetTokenExpiration: Date
  }, {
    timestamps: true // Adds createdAt and updatedAt fields
  });
  
  module.exports = mongoose.model('User', userSchema);
  