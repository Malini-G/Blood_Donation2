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
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
