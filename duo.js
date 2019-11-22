
const duo_web = require('@duosecurity/duo_web')
const addUser = require('./addUser')
const IFrame = require('./duoFrame')
const fs = require('fs')
const path = require('path')
const qs = require('querystring')
const url = require('url')
let ikey, skey, akey, api_hostname, hostname

if (fs.existsSync(path.join(__dirname, `./config.local.js`))) {
  ikey = require('./config.local.js').ikey
  skey = require('./config.local.js').skey
  api_hostname = require('./config.local.js').api_hostname
  akey = require('./config.local.js').akey || 'dummy'
  cookieTimer = require('./config.local.js').cookieTimer
  hostname = require('./config.local.js').hostname
  maxTime = require('./config.local.js').redirectTimer
} else {
  ikey = require('./config.js').ikey
  skey = require('./config.js').skey
  api_hostname = require('./config.js').api_hostname
  akey = require('./config.js').akey || 'dummy'
  cookieTimer = require('./config.js').cookieTimer
  hostname = require('./config.js').hostname
  maxTime = require('./config.js').redirectTimer
}

if (akey === 'dummy') {
  console.log('Configure the server properly')
  process.exit(1)
}

const post_action = '/'

const duoHandler = (req, res, next) => {
  const cookie = req.session.user
  let authenticated_username = ''
  if (cookie !== undefined)
    authenticated_username = cookie
  if (authenticated_username === '') {
    let query = url.parse(req.url, true).query
    let { username } = query
    if (username) {
      let sig_request = duo_web.sign_request(ikey, skey, akey, username)
      let duo_frame = IFrame(api_hostname, sig_request, post_action)
      // res.writeHead(200, { 'Content-Type': 'text/html' })
      res.status(200).send(duo_frame)
    } else {
      res.status(200).send(addUser())
    }
  }
}
const duoReceiver = (req, res, next) => {
  if (base_url === post_action) {
    let request_body = ''
    req.on('data', data => request_body += data.toString())
    req.on('end', () => {
      let form_data = qs.parse(request_body)
      let sig_response = form_data.sig_response
      let authenticated_username = duo_web.verify_response(ikey, skey, akey, sig_response)
      if (authenticated_username) {
        req.session.user = authenticated_username
        return next()

      } else {
        return next(createError(404))
      }
    })
  }
}

module.exports = { duoHandler, duoReceiver }