const express = require('express')
const app = express();
const path = require('path');
const axios = require('axios');
const port = process.env.PORT || 5000;
const pool = require('./db')
// Set my buildb  as a static folder.
// We just need to put the files in buils and it'll work
app.use('/', express.static(path.join(__dirname, 'client/build')));
app.use(express.json()) // to get data from the client side we need to use req.body and this allows us to access the req.body and get json data.

// DB ROUTES \\
// get all holdings
app.get('/trade', async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM holdings");
    res.json(response.rows);
  } catch (err) {
    console.error('error from server- get all holdings', err.message);
  }
})

// get a holding
app.get('/trade/:id', async (req, res) => {
  try {
    const { id } = req.params
    const response = await pool.query("SELECT * FROM holdings WHERE holding_id = ($1)", [id])
    res.json(response.rows[0]);
  } catch (err) {
    console.log('error from server- get a holding', err.message)
  }
})

// create new holding
app.post('/trade', async (req, res) => {
  try {
    const { name, symbol, shares, changePercent, price } = req.body;
    console.log(req.body);
    const newHolding = await pool.query("INSERT INTO holdings (name, symbol, shares, percent_change, price) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, symbol, shares, changePercent, price]);
    res.json(newHolding.rows[0]);
  } catch (err) {
    console.error('error from server- create new holding', err.message);
  }
})

// update existing holding
app.put('/trade/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { shares } = req.body;
    const updatedHolding = await pool.query("UPDATE holdings SET shares = $1 WHERE holding_id = $2 RETURNING *", [shares, id])
    res.json(updatedHolding.rows[0]);
  } catch (err) {
    console.error('error from server- update holding', err.message);
  }
})

// delete existing holding
app.delete('/trade/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHolding = await pool.query("DELETE FROM holdings WHERE holding_id = $1", [id]);
    res.send(`successfully deleted holding id: ${id}`);
  } catch (err) {
    console.error('error from server- delete holdings', err.message);
  }
})

// DB Register


// API ROUTES \\
app.get('/api/stocks/search', (req, res) => {
  const symbol = req.query.symbol
  console.log(symbol)
  axios.get(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=${symbol}&types=quote&token=pk_e187f175e42d4ac89045179e525ef0e5`)
    .then(response => {
      res.send(response.data[Object.keys(response.data)[0]].quote)
    })
    .catch(error => {
      console.log('error from server- API routes', error)
    })
})

app.get('/api/stocks/recommendation', (req, res) => {
  const companies = []
  axios.get('https://cloud.iexapis.com/stable/stock/market/batch?symbols=msft,nflx&types=quote&token=pk_e187f175e42d4ac89045179e525ef0e5')
    .then(function (response) {
      console.log(response.data)
      Object.keys(response.data).forEach(function (key) {
        companies.push(response.data[key].quote)
      })
      res.json(companies)
    })
    .catch(function (err) {
      console.log('error from server- API routes', err)
    })
})

app.get('/api/chart/search', (req, res) => {
  const symbol = req.query.symbol
  console.log(symbol)
  axios.get(`https://cloud.iexapis.com/stable/stock/${symbol}/chart/10d?token=pk_e187f175e42d4ac89045179e525ef0e5`)
    .then(response => {
      res.send(response.data)
    })
    .catch(error => {
      console.log('error from server- API routes', error)
    })
});

app.post('/register', async (req, res) => {
  try {
    const { user, email, password } = req.body;

    const userSelected = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email
    ]);
    if (userSelected.rows.length > 0) {
      return res.status(401).json("User already exists!");
    };

    const newUser = await pool.query("INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *", [user, email, password]);
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error('error from server- create new holding', err.message);
  }
});

app.get('/login', async (req, res) => {
  try {
    const { email, password } = req.query

    const user = await pool.query("SELECT * FROM users WHERE user_email = ($1)", [email]);

    // check if user exist
    if (user.rows.length === 0) {
      return res.status(401).json("User doesn't exists!");
    };
    // check passwords match http request and db
    if (user.rows[0].user_password !== password) {
      return res.status(401).json("Password don't match");
    };

    res.json(user.rows[0].user_id);

  } catch (err) {
    console.error('error from server- create new holding', err.message);
  }
});

app.get("/*", (req, res) => { res.sendFile(path.join(__dirname, "client", "build", "index.html")); });

app.listen(port, () => console.log(`Running on port: ${port}`));