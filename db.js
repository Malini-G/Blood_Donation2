// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',     // or your DB server address
  user: 'root',
  password: 'Malini@2005',
  database: 'blood_bank'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + connection.threadId);
});

module.exports = connection;
