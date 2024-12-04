// config/db.js
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: '115.187.62.16',    // Database host (e.g., 'localhost' or IP address)
  user: 'vihcppappuser', // Your MySQL username
  password: 'Vyoma@123', // Your MySQL password
  database: 'db_hcpp_office_application', // Your database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('error connecting to the database:', err.stack);
    return;
  }
  console.log('connected to the database');
});

module.exports = connection;
