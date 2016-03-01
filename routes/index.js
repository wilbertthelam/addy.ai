var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Addy.AI' });
});

/* GET stats given teamId */
router.get('/teamStats', function (req, res) {

	connection.query('SELECT * FROM test_table', function(err, rows) {
		if (err) {
			throw err;
		}

		// test data in debugger
		console.log('The solution is: ', rows[0].name);

		var success = true;
		var message = 'team stats';
		res.json({'status': success, 'message': message, 'data' : rows});
	});

});

module.exports = router;