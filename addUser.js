const addUser = () => {
  return `<!DOCTYPE html>
<html>

<head>
    <title>UserPreAuth</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
        body {
            text-align: center;
        }
    </style>
</head>

<body>
    <h1>Authenticate</h1>
    <form action="/" method="get">
        Id:
        <br>
        <input type="text" name="username" value="">
        <br>
        <input type="submit" value="Authenticate">
    </form>
</body>

</html>`
}
module.exports = addUser