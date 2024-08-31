const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ldrp',
  database: 'cab_booking_system'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging Middleware (for debugging)
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Failed to register user' });
        } else {
          res.redirect('/login.html');
        }
      });
    }
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        res.redirect('/home.html');
      } else {
        res.status(401).json({ message: 'Incorrect password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${3306}`);
});
