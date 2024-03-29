const mongoose = require('mongoose');

const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({

  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
  },

});

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

userSchema.methods.createUser = async function () {
  if (this.isNew || this.isModified('password')) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
