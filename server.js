// NPM Imports
const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const { ObjectID } = require('mongodb');
const bodyParser = require('body-parser');
// Local Imports
require('./config');
const User = require('./models/user');
const Food = require('./models/food');
const mongoose = require('./db/mongoose');
const authenticateUser = require('./middleware/authenticate');
// Consts
const app = express();
const port = process.env.PORT;
const checkId = id => ObjectID.isValid(id);

app
  .use(cors())
  .use(bodyParser.json())
  // Root
  .get('/', (req, res) => {
    return res.send('hello');
  })

  /* USER */
  // Update Consumed Calories
  .post('/users/me/consumed', authenticateUser, (req, res) => {
    const params = _.pick(req.body, ['_id', 'calories']);
    User.findByIdAndUpdate(
      params._id,
      { $set: { consumedCalories: params.calories } },
      { new: true }
    )
      .then(consumed => {
        if (!consumed) return res.status(404).send();
        res.send({ consumed });
      })
      .catch(error => res.status(400).send(error));
  })
  // Logout User
  .delete('/users/me/token', authenticateUser, (req, res) => {
    req.user
      .removeToken(req.token)
      .then(() => res.status(200).send())
      .catch(error => res.status(400).send());
  })
  // Get Logged In User
  .get('/users/me', authenticateUser, (req, res) => {
    res.send(req.user);
  })
  // Login User
  .post('/users/login', (req, res) => {
    const params = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(params.email, params.password)
      .then(user => {
        return user.generateAuthToken().then(token => {
          res.header('x-auth', token).send({ user, token });
        });
      })
      .catch(error => res.status(400).send(error));
  })
  // Create User
  .post('/users', (req, res) => {
    const user = new User(_.pick(req.body, ['email', 'password']));
    user
      .save()
      .then(() => user.generateAuthToken())
      .then(token => res.header('x-auth', token).send({ user, token }))
      .catch(error => res.status(400).send(error));
  })

  /* Food */
  // Get Foods
  .get('/foods/:author', (req, res) => {
    if (!req.params.author) return res.status(404).send('Invalid author');
    Food.findByAuthor(req.params.author)
      .then(foods => res.send(foods))
      .catch(error => res.status(400).send('Error, please try again later.'));
  })
  // Create Food
  .post('/foods', ({ body: { name, calories, author } }, res) => {
    if (!name || !calories || !author) {
      return res.status(400).send('Please provide all required values.');
    }
    new Food({ name, calories, author })
      .save()
      .then(food => res.send(food))
      .catch(error => res.status(400).send(error));
  })
  // Update Food
  .patch('/foods/:id', (req, res) => {
    if (!checkId(req.params.id)) return res.status(404).send();
    const params = _.pick(req.body, ['name', 'calories']);
    Food.findByIdAndUpdate(req.params.id, { $set: params }, { new: true })
      .then(food => {
        if (!food) return res.status(404).send();
        res.send({ food });
      })
      .catch(error => res.status(400).send(error));
  })
  // Delete Food
  .delete('/foods/:id', (req, res) => {
    if (!checkId(req.params.id)) return res.status(404).send();
    Food.findByIdAndRemove(req.params.id)
      .then(food => {
        if (!food) return res.status(404).send();
        res.send({ food });
      })
      .catch(error => res.status(400).send('Error, please try again later.'));
  })

  .listen(port, () => console.log(`Server up on port: ${port}`));

module.exports = app;
