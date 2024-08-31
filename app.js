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
  password: '',
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

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

      // Insert user into database
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Failed to register user' });
        } else {
          res.redirect('/login.html'); // Redirect to login page after successful signup
        }
      });
    }
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Fetch user from database
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.length > 0) {
      // Compare hashed password
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        res.redirect('/home.html'); // Redirect to home page after successful login
      } else {
        res.status(401).json({ message: 'Incorrect password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

// Handle 404 and 405 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((req, res, next) => {
  res.status(405).json({ message: 'Method not allowed' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
