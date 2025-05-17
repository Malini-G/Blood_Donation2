const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store
const users = [];

// Signup Route
app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;

    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    users.push({ email, password }); // Save to memory
    res.status(201).json({ message: 'Signup successful' });
});

// Login Route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
