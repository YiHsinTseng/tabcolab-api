require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const config = require('../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const User = require(`../${config[env].db.modelpath}/user`);

const googleOauth = async (req, res, next) => {
  try {
    const { authorization_code, redirect_url } = req.body;

    // 檢查請求是否包含授權碼
    if (!authorization_code) {
      throw new Error('Invalid request: authorization code is required');
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect_url,
    );

    // 使用授權碼來獲取 access token
    const { tokens } = await client.getToken(authorization_code);

    // 使用 access token 來獲取使用者資訊
    client.setCredentials(tokens);
    const people = google.people({
      version: 'v1',
      auth: client,
    });

    const me = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });

    const { emailAddresses, names, photos } = me.data;

    const email = emailAddresses[0].value;
    const name = names[0].displayName;
    const picture = photos[0].url;

    // 驗證 ID token 並獲取 googleId
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId } = ticket.getPayload();

    // 在這裡查找或創建使用者，並生成 JWT token
    let user = await User.findUserByGithubId(googleId);
    if (user) {
      console.log('使用者已經註冊過了。無須存入資料庫內。');
    } else {
      console.log('偵測到新用戶。須將資料存入資料庫內');

      user = new User({
        email,
        googleID: googleId,
        name,
        thumbnail: picture,
      });
      await user.createUser();
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
  googleOauth,
};
