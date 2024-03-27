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
  constructor(email, password) {
    this.user_id = generateUserId();
    this.email = email;
    this.password = password;
  }

  // 模擬 mongoose 的 comparePassword 方法
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  async generateAuthToken() {
    const tokenObject = { user_id: this.user_id, email: this.email };
    const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
    return token;
  }

  // 模擬 mongoose 的 pre save 中間件
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  static async findUserById(user_id, next) {
    try {
      const user = await db.get('users').find({ user_id }).value();
      if (!user) {
        throw new AppError(404, 'User not found or invalid user ID');
      }
      return new User(user.email, user.password);
    } catch (error) {
      next(error);
    }
  }

  static async findUserByEmail(email, next) {
    try {
      const user = await db.get('users').find({ email }).value();
      if (!user) {
        throw new AppError(404, 'User not found or invalid email');
      }
      return new User(user.email, user.password);
    } catch (error) {
      next(error);
    }
  }

  async createUser(next) {
    try {
      let users = db.get('users');
      if (!users.value()) {
        await db.defaults({ users: [] }).write();
        users = db.get('users');
      }
      await this.hashPassword();
      await users.push(this).write();
      return { success: true, message: 'User created successfully' };
    } catch (error) {
      next(error);
    }
  }

  static async emailExists(email) {
    const user = await db.get('users').find({ email }).value();
    return !!user;
  }
}

module.exports = User;
