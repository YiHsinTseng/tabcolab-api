const dotenv = require('dotenv');

dotenv.config();

const express = require('express');

const app = express();
const mongoose = require('mongoose');
require('../configs/passport');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const indexRoutes = require('../routes/index');

// 連結 mongoDB
mongoose
  .connect(process.env.MONGODB_COLLECTION || 'mongodb://localhost:27017')
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));

// 設定 Middleware以及排版引擎
app.set('view engine', 'ejs');
app.set(express.json());
app.set(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// 設定 routes
app.use('/', indexRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
