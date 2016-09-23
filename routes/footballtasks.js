/* Routes:
	- update DB with the league information (teams)
	- update DB with the league matchups for a given league
*/

var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

var async = require('async');

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

/* GET to run Py script to  */
router.get('/addLeagues', function (req, res) {
	// parameters passed via GET call
	var leagueId = req.query.leagueId;
	var seasonId = req.query.seasonId;

	var listOfStats;
	
	async.series({
		runPyScript: function (cb0) {
			PythonShell.run('./scraper/footballLeagueScraper.py', { mode: 'json', args: [leagueId, seasonId] }, function (err, results) {
				if (err) {
					throw err;
				}

				// console.log(JSON.stringify(results[0]));
				listOfStats = results[0];
				cb0(null, null);
			});
		}, 

		updateDb: function(cb1) {
			// console.log(listOfStats);

			connection.beginTransaction(function (err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});

			var statement = 'REPLACE INTO baseball_stats SET ?';
			async.each(listOfStats, function(teamStatLine, callback) {
				// console.log(teamStatLine);
				connection.query(statement, teamStatLine, function(err) {
					if (err) {
						connection.rollback();
						callback(err);
					} else {
						callback();
					}
				});
			}, function(err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot close transaction.', error: err});
				} else {
					connection.commit();
					cb1(null, null);
				}
			});
		},

	}, function(err) {
		if (err) {
			throw err;
		}
		return res.json({execSuccess: true, message: 'Successfully updated database.'});
	});
});

module.exports = router;