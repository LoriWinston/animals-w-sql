const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/animals', async(req, res) => {
  try {
    const data = await client.query('SELECT * from animals');
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/animals/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT * from animals where id=$1', [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/animals/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('delete from animals where id=$1 returning *', [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/animals', async(req, res) => {
  try {
    const data = await client.query(`
      insert into animals (species, temperament, owner_id) 
      values ($1, $2, $3)
      returning *
      `, 
    [
      req.body.species, 
      req.body.temperament, 
      1
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// our put route needs the ID of the item to update
app.put('/animals/:id', async(req, res) => {
  // we get that id through req.params
  const id = req.params.id;

  try {
    // then we update the candy
    const data = await client.query(`
      UPDATE animals
      SET species = $1, temperament = $2
      WHERE id=$3
      returning *;
    `,
    // this array is for SQL query sanitization
    [
      req.body.species, 
      req.body.temperament, 
      id,
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));
  
module.exports = app;
