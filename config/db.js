const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: '0.0.0.0',       
    user: 'root',            
    password: '',   
    database: 'chess'
});

module.exports = pool.promise();
