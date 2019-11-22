const IFrame = (api_hostname, sig_request, post_action) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Duo Authentication Prompt</title>
      <meta name='viewport' content='width=device-width, initial-scale=1'>
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <style>
        body {
            text-align: center;
        }

        iframe {
            width: 100%;
            min-width: 304px;
            max-width: 620px;
            height: 330px;
            border: none;
        }
      </style>
    </head>
    <body>
      <h1>Duo Authentication Prompt</h1>
      <iframe id="duo_iframe"
              title="Two-Factor Authentication"
              data-host= ${api_hostname}
              data-sig-request= ${sig_request}
              data-post-action=${post_action}
              >
      </iframe>
      <script src='https://api.duosecurity.com/frame/hosted/Duo-Web-v2.min.js'></script>
    </body>
  </html>`
}

module.exports = IFrame