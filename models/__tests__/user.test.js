const expect = require('expect');
const supertest = require('supertest');
const { ObjectID } = require('mongodb');

const User = require('../user');
const app = require('../../server');
const { initialUsers, populateUsers } = require('./seed');

beforeEach(populateUsers);

describe('POST /users', () => {
  it('Should create a user when valid info is given', done => {
    const email = 'unique.email@provider.com';
    const password = 'aNewUniquePasswordFromUser';

    supertest(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end(error => {
        if (error) return done(error);
        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch(error => done(error));
      });
  });

  it('Should not create a user if the email is already in use', done => {
    // Email is aleady in use because we seeded with populateUsers
    const email = initialUsers[0].email;
    const password = 'thisIsAnEntirelyValidPw';
    supertest(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('Should return validation errors if user info is invalid', done => {
    const email = 'invalid.email'; // Invalid email
    const password = '123'; // Too short (req length of 4)

    supertest(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('Should update a users consumed calories', done => {
    const newCalories = 12345;
    const { _id } = initialUsers[0];
    const token = initialUsers[0].tokens[0].token;

    supertest(app)
      .post('/users/me/consumed')
      .set('x-auth', token)
      .send({ calories: newCalories, _id })
      .expect(200)
      .end((error, res) => {
        if (error) return done(error);
        User.findById(_id)
          .then(user => {
            expect(user.consumedCalories).toBe(newCalories);
            done();
          })
          .catch(error => done(error));
      });
  });
});

describe('POST /users/login', () => {
  it('Should login a user and return an auth token if valid info is supplied', done => {
    const { email, password, _id } = initialUsers[1];
    supertest(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((error, res) => {
        if (error) return done(error);
        User.findById(_id)
          .then(user => {
            expect(user.tokens[0]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch(error => done(error));
      });
  });

  it('Should reject login with invalid credentials', done => {
    const { email, password, _id } = initialUsers[1];
    supertest(app)
      .post('/users/login')
      .send({ email, password: `${password} + makeItInvalid` })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((error, res) => {
        if (error) return done(error);
        User.findById(_id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(error => done(error));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('Should remove a token on logout if valid data is proved', done => {
    const token = initialUsers[0].tokens[0].token;
    supertest(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)
      .end((error, res) => {
        if (error) return done(error);
        User.findById(initialUsers[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(error => done(error));
      });
  });
});

describe('GET /users/me', () => {
  it('Should return a user if properly authenticated', done => {
    supertest(app)
      .get('/users/me')
      .set('x-auth', initialUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.email).toBe(initialUsers[0].email);
        expect(res.body._id).toBe(initialUsers[0]._id.toString());
      })
      .end(done);
  });

  it('Should return 401 status if not properly authenticated', done => {
    supertest(app)
      .get('/users/me')
      .set('x-auth', 'This is an invalid token')
      .expect(401)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
  });
});
