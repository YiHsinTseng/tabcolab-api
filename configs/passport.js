const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const { google } = require('googleapis');
const GithubStrategy = require('passport-github2');
const OAuth2Strategy = require('passport-oauth2');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
require('dotenv').config();
const config = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const User = require(`../${config[env].db.modelpath}/user`);

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.PASSPORT_SECRET;

passport.use(
  new JwtStrategy(opts, (async (jwt_payload, done) => {
    try {
      const foundUser = await User.findUserById(jwt_payload.user_id);
      if (foundUser) {
        return done(null, foundUser); // req.user <= foundUser
      }
      return done(null, false);
    } catch (e) {
      return done(e, false);
    }
  })),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('進入Google Strategy的區域');
      let user = await User.findUserByGoogleId(profile.id);
      if (user) {
        console.log('使用者已經註冊過了。無須存入資料庫內。');
      } else {
        console.log('偵測到新用戶。須將資料存入資料庫內');
        user = new User({
          email: profile.emails[0].value,
          googleID: profile.id,
          name: profile.displayName,
          thumbnail: profile.photos[0].value,
        });
        await user.createUser();
        console.log('成功創建新用戶。');
      }
      // Generate a token for the user
      const token = user.generateAuthToken();
      // Store the token in the user's session or send it to the frontend
      done(null, { user, token });
    },
  ),
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.CLOUD_GITHUB_CLIENT_ID,
      clientSecret: process.env.CLOUD_GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CLOUD_GITHUB_AUTH_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('進入 GithubStrategy 的區域');
      console.log(profile);
      console.log('=======================');
      let user = await User.findUserByGithubId(profile.id);
      if (user) {
        console.log('使用者已經註冊過了。無須存入資料庫內。');
      } else {
        console.log('偵測到新用戶。須將資料存入資料庫內');

        user = new User({
          githubID: profile.id,
          name: profile.username,
          thumbnail: profile.photos[0].value,
        });
        await user.createUser();
        console.log('成功創建新用戶。');
      }
      // Generate a token for the user
      const token = user.generateAuthToken();
      // Store the token in the user's session or send it to the frontend
      done(null, { user, token });
    },
  ),
);

passport.use(new OAuth2Strategy(
  {
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://<app-id>.chromiumapp.org/',
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const people = google.people({
        version: 'v1',
        auth: accessToken,
      });

      const res = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names,photos',
      });

      const user = res.data;

      const email = user.emailAddresses && user.emailAddresses.length > 0 ? user.emailAddresses[0].value : null;
      const displayName = user.names && user.names.length > 0 ? user.names[0].displayName : null;
      const photoUrl = user.photos && user.photos.length > 0 ? user.photos[0].url : null;
      const googleId = user.resourceName ? user.resourceName.split('/')[1] : null;

      let foundUser = await User.findUserByGoogleId(googleId);
      if (foundUser) {
        console.log('使用者已經註冊過了。無須存入資料庫內。');
      } else {
        console.log('偵測到新用戶。須將資料存入資料庫內');

        foundUser = new User({
          email,
          googleId,
          name: displayName,
          thumbnail: photoUrl,
        });
        await foundUser.save();
        console.log('成功創建新用戶。');
      }
      // Generate a token for the user
      const token = foundUser.generateAuthToken();
      // Store the token in the user's session or send it to the frontend
      cb(null, { foundUser, token });
    } catch (error) {
      cb(error);
    }
  },
));

module.exports = passport;
