var mysql = require('mysql');

// connection to MySQL server
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Abc123!@#',
  database : 'addy_ai'
});

module.exports = db;