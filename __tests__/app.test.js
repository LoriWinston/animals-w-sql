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

  test('creates a new animal and that new animal is in our animal list', async() => {
    // define the new candy we want create
    const newAnimal = {
      species: 'raccoon',
      temperament: 'stripey',
      owner_id: 1
    };
    // define what we expect that candy to look like after SQL does its thing
    const expectedAnimal = {
      ...newAnimal,
      id: 7,
      owner_id: 1
    };

    // use the post endpoint to create a candy
    const data = await fakeRequest(app)
      .post('/animals')
      // pass in our new candy as the req.body
      .send(newAnimal)
      .expect('Content-Type', /json/)
      .expect(200);
    console.log(data.body);
    // we expect the post endpoint to responds with our expected candy
    expect(data.body).toEqual(expectedAnimal);

    // we want to check that the new candy is now ACTUALLY in the database
    const allAnimals = await fakeRequest(app)
      // so we fetch all the candies
      .get('/animals')
      .expect('Content-Type', /json/)
      .expect(200);

    // we go and find the turkish delight
    const actual = allAnimals.body.find(animal => animal.species === 'raccoon');

    // we check to see that the turkish delight in the DB matches the one we expected
    expect(actual).toEqual(expectedAnimal);
  });

  test('updates an animal', async() => {
    // define the new candy we want create
    const newAnimal = {
      species: 'bear',
      temperament: 'judgemental',
      owner_id: 1
    };

    const expectedAnimal = {
      ...newAnimal,
      owner_id: 1,
      id: 1
    };

    // use the put endpoint to update a candy
    await fakeRequest(app)
      .put('/animals/1')
    // pass in our new candy as the req.body
      .send(newAnimal)
      .expect('Content-Type', /json/)
      .expect(200);

    // go grab the candy we expect to be updated
    const updatedAnimal = await fakeRequest(app)
      .get('/animals/1')
      .expect('Content-Type', /json/)
      .expect(200);

    // check to see that it matches our expectations
    expect(updatedAnimal.body).toEqual(expectedAnimal);
  });

  test('deletes a single animal with the matching id', async() => {
    const expectation = {
      'id': 2,
      'species': 'fox',
      'temperament': 'playful',
      'owner_id': 1
    };

    const data = await fakeRequest(app)
      .delete('/animals/2')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);

    const nothing = await fakeRequest(app)
      .get('/animals/2')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(nothing.body).toEqual('');
  });
  // afterAll(done => {
  //   return client.end(done);
  // });
});

