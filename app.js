const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let users = []; // In-memory user storage
let bookings = []; // In-memory bookings storage
let rideStatus = 'Waiting for driver...';

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.redirect('/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.redirect('/home.html');
  } else {
    res.send('Invalid credentials');
  }
});

app.post('/book', (req, res) => {
  const { pickup, dropoff } = req.body;
  bookings.push({ pickup, dropoff });
  res.redirect('/confirmation.html');
});

app.get('/status', (req, res) => {
  res.json({ message: rideStatus });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
