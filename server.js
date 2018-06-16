// NPM Imports
const express = require('express');
const bodyParser = require('body-parser');
// Local Imports
require('./config');
// Consts
const app = express();
const port = process.env.PORT;

app
  .use(bodyParser.json())
  .get('/', (req, res) => {
    return res.send('hello');
  })
  .listen(port, () => console.log(`Server up on port: ${port}`));

module.exports = app;
