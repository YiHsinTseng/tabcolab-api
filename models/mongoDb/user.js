const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateUserId } = require('../../utils/generateId');
const { UserGroup } = require('./group');
const AppError = require('../../utils/appError');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateUserId,
    alias: 'user_id',
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: 50,
  },
  googleID: {
    type: String,
  },
  githubID: {
    type: String,
  },
  thumbnail: {
    type: String,
  },

}, {
  toJSON: {
    transform(doc, ret) {
      const { _id, ...rest } = ret;
      const newRet = { user_id: _id, ...rest };
      return newRet;
    },
  },
});

userSchema.statics.findUserById = async function (user_id) {
  const user = await this.findById(user_id);
  if (!user) {
    throw new AppError(404, 'User not found or invalid user ID');
  }
  return user;
};

userSchema.statics.findUserByGoogleId = async function (google_id) {
  const user = await this.findOne({ googleID: google_id });
  return user;
};

userSchema.statics.findUserByGithubId = async function (github_id) {
  const user = await this.findOne({ githubID: github_id });
  return user;
};

userSchema.statics.findUserByEmail = async function (email) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new AppError(404, 'User not found or invalid email');
  }
  return user;
};

// 實現 comparePassword 方法
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// 實現 generateAuthToken 方法
userSchema.methods.generateAuthToken = function () {
  const tokenObject = {
    user_id: this.user_id, email: this.email, version: 'v1.0',
  };
  const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET, { expiresIn: '7d' });
  return token;
};

// 實現 emailExists 靜態方法
userSchema.statics.emailExists = async function (email) {
  const user = await this.findOne({ email });
  return !!user;
};

// 實現 createUser 實例方法
userSchema.methods.createUser = async function () {
  await this.save();

  const userGroup = new UserGroup({
    _id: this._id,
    groups: [],
  });
  await userGroup.save();

  return { success: true, message: 'User created successfully' };
};

userSchema.statics.getAllUsers = async function () {
  const users = await this.find().select('-__v');
  const userObjects = users.map((user) => {
    const userObject = user.toJSON();
    delete userObject.password;
    return userObject;
  });
  return { success: true, users: userObjects };
};

userSchema.statics.getUserInfo = async function (user_id) {
  const user = await this.findById(user_id).select('-__v');
  if (user) {
    // 將 user 物件轉換為一個普通的 JavaScript 物件
    const userObject = user.toJSON();
    // 刪除 password 屬性
    delete userObject.password;
    return { success: true, user: userObject };
  }
  return { success: false };
};

userSchema.methods.updateUserInfo = async function (user_id) {
  // `this` refers to the instance of the model
  const user = this;

  // Update the user in the database
  await User.findOneAndUpdate(
    { _id: user_id }, // find a document with this filter
    user, // document to insert when nothing was found
    { new: true, upsert: true, runValidators: true }, // options
  );

  return { success: true, message: 'User info updated successfully' };
};

userSchema.methods.updateUserPassword = async function (password) {
  // `this` refers to the instance of the model
  const user = this;

  // Hash the new password before saving
  user.password = password;

  await user.save();

  return { success: true, message: 'User password updated successfully' };
};

userSchema.statics.deleteUser = async function (user_id) {
  // `this` refers to the model
  const User = this;

  // Delete the user from the database
  const deletedUser = await User.findByIdAndDelete(user_id);

  if (deletedUser) {
    return { success: true, message: 'User deleted successfully' };
  }
  throw new Error('User not found');
};

// 實現 hashPassword 中間件
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new) and password exists
  if (this.password && (this.isNew || this.isModified('password'))) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.pre('remove', async function (next) {
  // 'this' is the user
  const user = this;

  // Remove all UserGroup objects that reference this user
  await mongoose.model('UserGroup').deleteMany({ user_id: user._id });

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
