const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
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
module.exports = passport;
