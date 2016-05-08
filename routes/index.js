var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;
var async = require('async');

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

// current week MANUALLY SET FOR NOW
var currentWeek = 5;

// league information
var leagueId = 44067;
var seasonId = 2016;
var totalTeams = 8;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'Addy.AI' });
});

/* GET team information. */
router.get('/teams', function(req, res) {
	var statement = 'SELECT * FROM teams ORDER BY team_id;';
	connection.query(statement, function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get teams.', error: err});
		} else {
			return res.json({ execSuccess: true, message: 'Teams successfully retrieved.', data: results});
		}
	});
});

/* GET current week stats information. */
router.get('/stats', function(req, res) {
	var statement = 'SELECT * FROM statv WHERE week = ? AND league_id = ? AND year = ? ORDER BY HR DESC;';
	connection.query(statement, [currentWeek, leagueId, seasonId], function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get stats.', error: err});
		} else {
			return res.json({ execSuccess: true, message: 'Stats successfully retrieved.', data: results});
		}
	});
});

/* GET cumulative stats information. */
router.get('/cumulativeStats', function(req, res) {
	var statement = 'SELECT * FROM statv WHERE league_id = ? AND year = ? ORDER BY week, team_id;';
	connection.query(statement, [leagueId, seasonId], function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get cumulative stats.', error: err});
		} else {
			return res.json({ execSuccess: true, message: 'Cumulative stats successfully retrieved.', data: results});
		}
	});
});

/* Calculate power rankings*/
router.get('/getPowerRankings', function (req, res) {
	// run python web scraper and return data as JSON
	var powerRankings;
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./pralgo.py', {mode: 'json', args: [totalTeams, currentWeek] }, function(err, results) {
				if (err) {
					throw err;
				}

				//console.log(JSON.stringify(results[0]));
				powerRankings = results;
				cb0(null, null);
			});
		}, 
	}, function(err) {
		if (err) {
			throw err;
		}
		res.json({execSuccess: true, data: powerRankings});
	});
});

/* Populate all the old stats prior to a certain week */
router.get('/populatePastStats', function (req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/pastScoreScraper.py', {mode: 'json', args: [currentWeek, leagueId, seasonId] }, function(err, results) {
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
		res.json({execSuccess: true, message: 'Successfully updated database.'});
	});
});

/* Populate all the current week's stats */
router.get('/populateCurrentStats', function (req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/currentScoreScraper.py', {mode: 'json', args: [currentWeek, leagueId, seasonId] }, function(err, results) {
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
		return res.json({execSuccess: true, message: 'Successfully updated database.'});
	});

});

module.exports = router;