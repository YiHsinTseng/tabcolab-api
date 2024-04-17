// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20');
// const GithubStrategy = require('passport-github2');
// const User = require('../models/mongoDb/user');

// passport.serializeUser((user, done) => {
//   console.log('Serialize User');
//   console.log(user);
//   done(null, user._id); // 將mongoDB的_id存入session內
//   // 並且將id簽名後，以cookie的形式回傳到瀏覽器給使用者
// });

// passport.deserializeUser(async (_id, done) => {
//   console.log(
//     'Deserialize User 使用serializeUser存入的id，去找到資料庫內的資料',
//   );
//   const foundUser = await User.findById({ _id }).exec();
//   done(null, foundUser); // 將user物件存入req.user，這個屬性設定為foundUser
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log('進入 GoogleStrategy 的區域');
//       console.log(profile);
//       console.log('=======================');
//       const foundUser = await User.findOne({ googleID: profile.id }).exec();
//       if (foundUser) {
//         console.log('使用者已經註冊過了，無需存入資料庫內');
//         done(null, foundUser);
//       } else {
//         console.log('偵測到新用戶，須將資料存入資料庫內');
//         const newUser = new User({
//           name: profile.displayName,
//           googleID: profile.id,
//           thumbnail: profile.photos[0].value,
//           email: profile.emails[0].value,
//         });
//         const savedUser = await newUser.save();
//         console.log('成功創建新用戶，並存入資料庫內');
//         done(null, savedUser);
//       }
//     },
//   ),
// );

// passport.use(
//   new GithubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: process.env.GITHUB_AUTH_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       console.log('進入 GithubStrategy 的區域');
//       console.log(profile);
//       console.log('=======================');
//       const foundUser = await User.findOne({ githubID: profile.id }).exec();
//       if (foundUser) {
//         console.log('使用者已經註冊過了，無需存入資料庫內');
//         done(null, foundUser);
//       } else {
//         console.log('偵測到新用戶，須將資料存入資料庫內');
//         const newUser = new User({
//           name: profile.username,
//           githubID: profile.id,
//           thumbnail: profile.photos[0].value,
//           githubURL: profile.profileUrl,
//         });
//         const savedUser = await newUser.save();
//         console.log('成功創建新用戶，並存入資料庫內');
//         done(null, savedUser);
//       }
//     },
//   ),
// );

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const jsonServer = require('json-server');
const config = require('../../../configs/config.json');

const env = process.env.NODE_ENV || 'development';
// const { db } = jsonServer.router(config[env].db.path);
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

module.exports = passport;
