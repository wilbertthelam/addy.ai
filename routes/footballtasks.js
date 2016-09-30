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

/* POST to run add league data for a new league  
	1. parse league information - TODO
	2. check if league is private or not - TODO
	3. check to see if league already exists - TODO
	4. run python script to get league
	5. update the DB with the teams
	6. update the DB with the matchups
*/
router.post('/addLeague', function (req, res) {
	// parameters passed via GET call
	var leagueId = req.body.leagueId;
	var seasonId = req.body.seasonId;

	console.log(leagueId)
	console.log(seasonId)
	var data;
	
	async.series({
		runPyScript: function (cb0) {
			PythonShell.run('./scraper/footballLeagueScraper.py', { mode: 'json', args: [leagueId, seasonId] }, function (err, results) {
				if (err) {
					throw err;
				}

				console.log(JSON.stringify(results[0]));
				data = results[0];
				cb0(null, null);
			});
		}, 

		updateDbTeams: function(cb1) {
			console.log(data);

			connection.beginTransaction(function (err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});

			var statement = 'INSERT INTO addy_ai_football.teams SET ?';
			async.each(data.teams, function(row, callback) {
				// console.log(row);
				connection.query(statement, row, function(err) {
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

		updateDbMatchups: function(cb1) {
			// console.log(listOfStats);

			connection.beginTransaction(function (err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});

			var statement = 'INSERT INTO addy_ai_football.matchups SET ?';
			async.each(data.matchups, function(row, callback) {
				// console.log(row);
				connection.query(statement, row, function(err) {
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