const createError = require('http-errors')
const express = require('express')
const path = require('path')
const session = require('express-session')
const logger = require('morgan')
const { duoHandler, duoReceiver } = require('./duo')

const app = express()

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(duoHandler)
app.use(duoReceiver)

app.use(express.static('www'))

app.use((req, res, next) => next(createError(404)))

app.use(express.static(path.join(__dirname, 'public')))


module.exports = app
