// NPM Imports
const express = require('express');
const bodyParser = require('body-parser');
// Local Imports
require('./config');
const mongoose = require('./db/mongoose');
// Consts
const app = express();
const port = process.env.PORT;

app
  .use(bodyParser.json())
  // Root
  .get('/', (req, res) => {
    return res.send('hello');
  })
  // Create User
  .post('/users', (req, res) => {
    const user = new User(_.pick(req.body, ['email', 'password']));
    user
      .save()
      .then(() => user.generateAuthToken())
      .then(token => res.header('x-auth', token).send(user))
      .catch(error => res.status(400).send('Error, please try again'));
  })
  .listen(port, () => console.log(`Server up on port: ${port}`));

module.exports = app;
