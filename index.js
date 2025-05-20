const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Import the DB connection

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Signup route
app.post('/api/auth/signup', (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    gender,
    blood_group,
    dob, // Expecting in dd/mm/yyyy
    password
  } = req.body;

  if (
    !name || !phone || !email || !address ||
    !gender || !blood_group || !dob || !password
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Convert dob to yyyy-mm-dd for MySQL
  const [day, month, year] = dob.split('/');
  const formattedDob = `${year}-${month}-${day}`;

  const query = `
    INSERT INTO users (name, phone, email, address, gender, blood_group, dob, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, phone, email, address, gender, blood_group, formattedDob, password], (err, result) => {
    if (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'Database error or email already exists' });
    }
    res.status(200).json({ message: 'Signup successful' });
  });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Get all donors
app.get('/api/donors', (req, res) => {
  const query = `SELECT name, phone, address, blood_group, dob FROM users WHERE is_donor = 1`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(results);
  });
});

// Mark user as donor
app.post('/api/user/become-donor', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const query = `UPDATE users SET is_donor = 1 WHERE email = ?`;
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Donor added successfully' });
  });
});

// GET all events
app.get('/api/events', (req, res) => {
  const query = 'SELECT id, name, location, date FROM events ORDER BY date ASC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json(results);
  });
});

// POST new event
app.post('/api/events', (req, res) => {
  const { name, location, date } = req.body;

  if (!name || !location || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Assuming date is sent as 'YYYY-MM-DD'
  const query = 'INSERT INTO events (name, location, date) VALUES (?, ?, ?)';
  db.query(query, [name, location, date], (err, result) => {
    if (err) {
      console.error('Error inserting event:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    // 201 Created
    res.status(201).json({ message: 'Event added successfully', eventId: result.insertId });
  });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
