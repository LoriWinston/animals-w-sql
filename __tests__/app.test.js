require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns all animals', async() => {

      const expectation = [
        {
          id: 1,
          species: 'bear',
          temperament: 'judgemental',
          owner_id: 1
        },
        {
          id: 2,
          species: 'fox',
          temperament: 'playful',
          owner_id: 1
        },
        {
          id: 3,
          species: 'rodent',
          temperament: 'chill af',
          owner_id: 1
        },
        {
          id: 4,
          species: 'wildcat',
          temperament: 'badass',
          owner_id: 1
        },
        {
          id: 5,
          species: 'wildcat',
          temperament: 'wise',
          owner_id: 1
        },
        {
          id: 6,
          species: 'mythical',
          temperament: 'aloof whimsy',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/animals')
        // .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns a single animal with the matching id', async() => {

      const expectation = {
        id: 1,
        species: 'bear',
        temperament: 'judgemental',
        owner_id: 1
      };
    
      const data = await fakeRequest(app)
        .get('/animals/1')
        .expect('Content-Type', /json/)
        .expect(200);
    
      expect(data.body).toEqual(expectation);
    });
  });
});

