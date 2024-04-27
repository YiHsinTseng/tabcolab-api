require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const env = process.env.NODE_ENV || 'development';

const config = require('../configs/config.json');

const User = require(`../${config[env].db.modelpath}/user`);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res, next) => {
  try {
    const { authorizationCode } = req.body;

    // 檢查請求是否包含授權碼
    if (!authorizationCode) {
      throw new Error('Invalid request: authorization code is required');
    }

    // 使用授權碼來獲取 access token
    const { tokens } = await client.getToken(authorizationCode);

    // 使用 access token 來獲取使用者資訊
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const {
      email, name, picture, sub: googleId,
    } = ticket.getPayload();

    // 在這裡查找或創建使用者，並生成 JWT token
    let user = await User.findUserByGoogleId(googleId);
    if (user) {
      console.log('使用者已經註冊過了。無須存入資料庫內。');
    } else {
      console.log('偵測到新用戶。須將資料存入資料庫內');

      user = new User({
        email,
        googleId,
        name,
        thumbnail: picture,
      });
      await user.save();
      console.log('成功創建新用戶。');
    }
    // Generate a token for the user
    const token = user.generateAuthToken();

    // 回傳 JWT token 給前端
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleLogin,
};
