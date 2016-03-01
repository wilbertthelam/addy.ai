var mysql = require('mysql');

// connection to MySQL server
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Abc123!@#',
  database : 'addyai_tester'
});

module.exports = db;