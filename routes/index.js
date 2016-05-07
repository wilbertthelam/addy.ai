var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;
var async = require('async');

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

// current week
var currentWeek = 5;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Addy.AI' });
});

/* Populate all the old stats prior to a certain week */
router.get('/populatePastStats', function (req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/pastScoreScraper.py', {mode: 'json', args: [currentWeek] }, function(err, results) {
				if (err) {
					throw err;
				}

				//console.log(JSON.stringify(results[0]));
				listOfStats = results[0];
				cb0(null, null);
			});
		}, 

		updateDb : function(cb1) {
			console.log(listOfStats);
			
			connection.beginTransaction(function(err){
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});
			for (var i = 0; i < listOfStats.length; i++) {
				var newOrderStmnt = 'INSERT INTO baseball_stats SET ?';
				connection.query(newOrderStmnt, [listOfStats[i]], function(err) {
					if (err) {
						connection.rollback();
						return res.json({ execSuccess: false, message: 'Cannot close transaction.', error: err});
					} else {
						connection.commit();
					}
				});
			}
			cb1(null, null);
		},

	}, function(err) {
		if (err) {
			throw err;
		}
		res.json({execSucess: true, message: 'Successfully updated database.'});
	});
});

/* Populate all the current week's stats */
router.get('/populateCurrentStats', function (req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/currentScoreScraper.py', {mode: 'json', args: [currentWeek] }, function(err, results) {
				if (err) {
					throw err;
				}

				listOfStats = results[0];
				cb0(null, null);
			});
		}, 

		updateDb : function(cb1) {
			console.log(listOfStats);
			
			connection.beginTransaction(function(err){
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});
			for (var i = 0; i < listOfStats.length; i++) {
				var newOrderStmnt = 'INSERT INTO baseball_stats SET ?';
				connection.query(newOrderStmnt, [listOfStats[i]], function(err) {
					if (err) {
						connection.rollback();
						return res.json({ execSuccess: false, message: 'Cannot close transaction.', error: err});
					} else {
						connection.commit();
					}
				});
			}
			cb1(null, null);
		},

	}, function(err) {
		if (err) {
			throw err;
		}
		res.json({execSucess: true, message: 'Successfully updated database.'});
	});

});

module.exports = router;