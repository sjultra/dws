/*
* Copyright (c) 2015 Bashar Al-Rawi.  All rights reserved.
* Copyrights licensed under the MIT License.
* See the accompanying LICENSE file in README.md credits section for terms.
*/

const express = require('express'),
  flash = require('connect-flash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  DuoStrategy = require('./passport-duo').Strategy,
  fs = require('fs'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  RedisStore = require('connect-redis')(session),
  redis = require('redis'),
  redisClient = redis.createClient()

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'username',
    passReqToCallBack: true
  },
  function (user, _, done) {
    if (user === '') return done(null, false, { message: 'Invalid username' })
    return done(null, user)
  }))

let ikey, skey, akey, api_hostname
const loginUrl = '/login-duo'
if (fs.existsSync(path.join(__dirname, `./config.local.js`))) {
  ikey = require('./config.local.js').ikey
  skey = require('./config.local.js').skey
  api_hostname = require('./config.local.js').api_hostname
  akey = require('./config.local.js').akey || 'dummy'
} else {
  ikey = require('./config.js').ikey
  skey = require('./config.js').skey
  api_hostname = require('./config.js').api_hostname
  akey = require('./config.js').akey || 'dummy'
}

if (akey === 'dummy') {
  console.log('Configure the server properly')
  process.exit(1)
}

passport.use(new DuoStrategy(ikey, skey, api_hostname, loginUrl))

const app = express()

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs-locals'))
app.use(express.static(__dirname + '/assets/'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({
  store: new RedisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 260 }),
  resave: false,
  saveUninitialized: false,
  secret: skey
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.get('/', ensureSecondFactor)
app.get('/', express.static(__dirname + '/www'))
app.get('/login', (req, res) => res.render('login', { user: req.user, message: req.flash('error') }))

app.get('/login-duo', function (req, res, next) {
  res.render('login-duo', {
    user: req.user, host: req.query.host,
    post_action: req.query.post_action, sig_request: req.query.signed_request
  })
})

app.post('/login', passport.authenticate('local', { successRedirect: '/auth-duo', failureRedirect: '/login', failureFlash: true }))

app.get('/auth-duo',
  passport.authenticate('duo', { failureRedirect: '/auth-duo', failureFlash: true }), (req, res, next) => next())

app.post('/auth-duo',
  passport.authenticate('duo', { failureRedirect: '/auth-duo', failureFlash: true }), (req, res) => { req.session.secondFactor = 'duo'; res.redirect('/') })

app.listen(3000, function () {
  console.log('Express server listening on port 3000')
})

function ensureSecondFactor(req, res, next) {
  if (!req.user) return res.redirect('/login')
  if (req.session.secondFactor !== 'duo') return res.redirect('/auth-duo')
  next()
}
