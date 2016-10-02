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

var loginAuth = require('./utilities/loginAuthenticationMiddleware.js');

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

/* POST to run add league data for a new league  
	1. parse league information
	2. check if league is private or not
	3. check to see if league already exists
	4. run python script to get league
	5. update the DB with the league (MUST BE BEFORE OTHER DB UPDATES TO GET THE auto generated league_id)
	6. update the DB with the teams
	7. update the DB with the matchups
	
*/
router.post('/createNewLeague', loginAuth.isAuthenticated, function (req, res) {
	// parameters passed via GET call
	var espnId = req.body.espnId;
	var leagueId;
	var seasonId = req.body.seasonId;

	console.log(leagueId);
	console.log(seasonId);
	
	var infoData;
	var data;
	
	async.series({
		checkIfLeagueExists: function (cb0) {
			var statement = 'SELECT * FROM addy_ai_football.leagues WHERE espn_id = ?;';
			connection.query(statement, [espnId], function (err, results) {
				if (err) {
					return res.json({ execSuccess: false, message: 'DB error in checkIfLeagueExists.', error: err });
				}

				console.log(JSON.stringify(results));
				if (results.length > 0) {
					console.log('League already exists');
					return res.json({ execSuccess: false, message: 'League already exists.', code: 'ERR_DUPLICATE_ESPN_ID', data: [] });
				} else {
					console.log('LeagueId is available');
					return cb0(null, "League available");
				}
			});
		},

		runPyScript: function (cb0) {
			PythonShell.run('./scraper/footballLeagueInfoScraper.py', { mode: 'json', args: [espnId, seasonId] }, function (err, results) {
				if (err) {
					throw err;
				}

				// console.log('All matchups: ' + JSON.stringify(results[0]));
				infoData = results[0];

				if (infoData === 'empty') {
					console.log('league privated');
					return res.json({ execSuccess: false, message: 'League appears to be privated or does not exist.', code: 'ERR_PRIVATE_NOT_EXIST', error: err});
				}

				cb0(null, null);
			});
		}, 

		updateDbLeague: function(cb1) {
			// console.log(listOfStats);

			connection.beginTransaction(function (err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});

			var statement = 'INSERT INTO addy_ai_football.leagues SET ?';
			// console.log(data.league);
			connection.query(statement, infoData.league, function(err, result) {
				if (err) {
					connection.rollback();
					return res.json({ execSuccess: false, message: 'Cannot close transaction into leagues.', error: err });
				} else {
					connection.commit();
					leagueId = result.insertId;
					cb1(null, null);
				}
			});
		},

		runPyScriptRest: function (cb0) {
			PythonShell.run('./scraper/footballLeagueScraper.py', { mode: 'json', args: [leagueId, seasonId, espnId] }, function (err, results) {
				if (err) {
					throw err;
				}

				if (infoData === 'invalid_league') {
					console.log('league type not correct');
					return res.json({ execSuccess: false, message: 'Only H2H leagues supported.', code: 'ERR_INV_LEAGUE_TYPE', error: err});
				}
				// console.log('All matchups: ' + JSON.stringify(results[0]));
				data = results[0];
				cb0(null, null);
			});
		},


		updateDbTeams: function(cb1) {
			// console.log(data);

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
					return res.json({ execSuccess: false, message: 'Cannot close transaction.', error: err });
				} else {
					connection.commit();
					res.json({execSuccess: true, message: 'Added league to the database.', data: infoData });
				}
			});
		},
	}, function(err) {
		if (err) {
			throw err;
		}
		return res.json({execSuccess: true, message: 'Reached the end of database update.' });
	});
});

module.exports = router;