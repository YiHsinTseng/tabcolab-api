const env = process.env.NODE_ENV || 'development';

const config = require('../configs/config.json');

const User = require(`../${config[env].db.modelpath}/user`);

const ErrorResponse = (statusCode, message, res) => {
  const status = statusCode === 500 ? 'error' : 'fail';
  res.status(statusCode).json({ status, message });
};

const register = async (req, res, next) => {
  try {
    // 確認信箱是否被註冊過
    const emailExist = await User.emailExists(req.body.email);
    if (emailExist) return ErrorResponse(400, 'This email has already been registered', res);

    // 製作新用戶
    const {
      email, password,
    } = req.body;
    const newUser = new User({ email, password });
    const token = await newUser.generateAuthToken();
    const result = await newUser.createUser();
    if (result.success) {
      return res.status(201).json({ message: result.message, token });
    }

    return ErrorResponse(400, 'Failed to register', res);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // 確認信箱是否被註冊過
    const foundUser = await User.findUserByEmail(req.body.email);
    if (!foundUser) {
      return ErrorResponse(401, 'Unable to find user. Please confirm if the email is correct', res);
    }

    const isMatch = await foundUser.comparePassword(req.body.password);
    if (isMatch) {
      const token = await foundUser.generateAuthToken();
      return res.send({
        message: '成功登入',
        token,
      });
    }
    return ErrorResponse(401, 'Incorrect password', res);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await User.getAllUsers();
    if (result.success) {
      return res.status(200).json({ users: result.users });
    }
    return ErrorResponse(400, 'Cannot get users', res);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const result = await User.getUserInfo(user_id);
    if (result.success) {
      return res.status(200).json({ user: result.user });
    }
    return ErrorResponse(400, 'Cannot get users', res);
  } catch (error) {
    next(error);
  }
};

const updateUserInfo = async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const userToUpdate = await User.findUserById(user_id);

    const { email, password } = req.body;

    // Check that only one of email, password is present
    const numProps = [email, password].filter((prop) => prop !== undefined).length;
    if (numProps !== 1) {
      return ErrorResponse(400, 'Invalid request body, only one of email or password should be present', res);
    }

    let result;

    if (user_id && email) {
      // 確認信箱是否被註冊過
      const emailExist = await User.emailExists(email);
      if (emailExist) return ErrorResponse(400, 'This email has already been registered', res);
      userToUpdate.email = email;
      result = await userToUpdate.updateUserInfo(user_id);
    } else if (user_id && password) {
      result = await userToUpdate.updateUserPassword(password);
    } else {
      return ErrorResponse(400, 'Invalid request body', res);
    }

    if (result.success) {
      return res.status(200).json({ message: result.message });
    }
    return ErrorResponse(400, 'User failed to update', res);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.user;

    const result = await User.deleteUser(user_id, next);
    if (result.success) {
      return res.status(200).json({ message: result.message });
    }
    return ErrorResponse(400, 'User failed to delete', res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register, login, getAllUsers, getUserInfo, updateUserInfo, deleteUser,
};
