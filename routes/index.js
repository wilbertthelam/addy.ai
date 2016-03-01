var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Addy.AI' });
});

/* GET stats given teamId */
router.get('/teamStats', function (req, res) {
	// run python web scraper and return data as JSON
	
	var jsonMessage = {};
	PythonShell.run('./scraper/scraper.py', function(err, results) {
		if (err) {
			throw err;
		}
		var success = true;
		var message = 'team and team stats';
		// console.log(results);

		jsonMessage.status = success;
		jsonMessage.message = message;
		jsonMessage.title = 'Addy.AI Tester Page';
		jsonMessage.teams = results[0];
		jsonMessage.stats = results[1];

		res.render('index',jsonMessage);
		// res.json(jsonMessage); // activate when we have front end framework

	});



	// connection.query('SELECT * FROM test_table', function(err, rows) {
	// 	if (err) {
	// 		throw err;
	// 	}

	// 	// test data in debugger
	// 	console.log('The solution is: ', rows[0].name);

	// 	var success = true;
	// 	var message = 'team stats';
	// 	res.json({'status': success, 'message': message, 'data' : rows});
	// });

});

module.exports = router;