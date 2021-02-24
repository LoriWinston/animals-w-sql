const client = require('../lib/client');
// import our seed data:
const animals = require('./animals.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const { temperaments } = require('./temperament');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      temperaments.map(temperament => {
        return client.query(`
                    INSERT INTO temperaments (temperament)
                    VALUES ($1);
                `,
        [temperament.temperament]);
      })
    );

    await Promise.all(
      animals.map(animal => {
        return client.query(`
                    INSERT INTO animals (species, temperament_id, owner_id)
                    VALUES ($1, $2, $3);
                `,
        [animal.species, animal.temperament_id, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
