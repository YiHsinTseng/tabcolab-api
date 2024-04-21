const jsonServer = require('json-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { db } = jsonServer.router(config[env].db.path);
const AppError = require('../../utils/appError');
const { generateUserId } = require('../../utils/generateId');

class User {
  /**
   * @param {string} email
   * @param {string} password
   */
  constructor({ email, password }) {
    this.user_id = generateUserId();
    this.email = email;
    this.password = password;
  }

  // 模擬 mongoose 的 comparePassword 方法
  async comparePassword(password) {
    if (!this.password) {
      throw new Error('Hashed password is required');
    }
    return bcrypt.compare(password, this.password);
  }

  async generateAuthToken() {
    const tokenObject = {
      user_id: this.user_id, email: this.email, version: 'v1.0',
    };
    const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET, { expiresIn: '7d' });
    return token;
  }

  // 模擬 mongoose 的 pre save 中間件
  async hashPassword() {
    if (!this.password) {
      throw new Error('Password is required');
    }
    this.password = await bcrypt.hash(this.password, 10);
  }

  static async findUserById(user_id) {
    const user = await db.get('users').find({ user_id }).value();
    if (!user) {
      throw new AppError(404, 'User not found or invalid user ID');
    }

    const foundUser = new User(user);
    foundUser.user_id = user.user_id;
    return foundUser;
  }

  static async findUserByEmail(email) {
    const user = await db.get('users').find({ email }).value();
    if (!user) {
      throw new AppError(404, 'User not found or invalid email');
    }

    const foundUser = new User(user);
    foundUser.user_id = user.user_id;
    return foundUser;
  }

  async createUser() {
    let users = db.get('users');
    let userGroups = db.get('user_groups');
    if (!users.value()) {
      await db.defaults({ users: [] }).write();
      users = db.get('users');
      userGroups = db.get('user_groups');
    }
    await this.hashPassword();
    await users.push(this).write();
    await userGroups.push({ user_id: this.user_id, groups: [] }).write();
    return { success: true, message: 'User created successfully' };
  }

  static async emailExists(email) {
    const user = await db.get('users').find({ email }).value();
    return !!user;
  }

  static async getAllUsers() {
    const users = await db.get('users').value();
    return { success: true, users };
  }

  static async getUserInfo(user_id) {
    const user = await db.get('users').find({ user_id }).value();
    return { success: true, user: { user_id: user.user_id, email: user.email } };
  }

  async updateUserInfo(user_id) {
    // Update the user in the database
    await db.get('users')
      .find({ user_id })
      .assign(this)
      .write();

    return { success: true, message: 'User info updated successfully' };
  }

  async updateUserPassword(password) {
    // Update the user in the database
    this.password = password;
    await this.hashPassword();
    await db.get('users')
      .find({ user_id: this.user_id })
      .assign(this)
      .write();

    return { success: true, message: 'User password updated successfully' };
  }

  static async deleteUser(user_id) {
    await this.findUserById(user_id);

    const deletedUser = await db.get('users')
      .remove((user) => user.user_id === user_id)
      .write();

    if (deletedUser.length > 0) {
      return { success: true, message: 'User deleted successfully' };
    }
  }
}

module.exports = User;
