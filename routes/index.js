var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;
var async = require('async');

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

// cronjob to update the database
var CronJob = require('cron').CronJob;
var request = require('request');

// current week MANUALLY SET FOR NOW
var currentWeek = 8;

// league information
var leagueId = 44067;
var seasonId = 2016;
var totalTeams = 8;

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', { title: 'addy.ai' });
});

/* GET news page. */
router.get('/news', function(req, res) {
	res.render('news', { title: 'news | addy.ai'});
});

/* GET editor page. */
router.get('/editor', function(req, res) {
	res.render('editor', { title: 'editor | addy.ai'});
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
	var statement = 'SELECT * FROM statv WHERE week = ? AND league_id = ? AND year = ?;';
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

/* GET current player week stats information. */
router.get('/weeklyPlayerStats', function(req, res) {
	var statement = 'SELECT * FROM weekly_player_statv WHERE week = ? AND league_id = ? AND season_id = ?;';
	connection.query(statement, [currentWeek, leagueId, seasonId], function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get stats.', error: err});
		} else {
			return res.json({ execSuccess: true, message: 'Stats successfully retrieved.', data: results});
		}
	});
});

/* Calculate power rankings*/
router.get('/powerRankings', function (req, res) {
	// run python web scraper and return data as JSON
	var powerRankings;
	var teamResults;
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./pralgo.py', {mode: 'json', args: [totalTeams, currentWeek] }, function(err, results) {
				if (err) {
					throw err;
				}

				//console.log(JSON.stringify(results[0]));
				powerRankings = results[0];
				cb0(null, null);
			});
		},

		getTeams: function(cb1) {
			var statement = 'SELECT * FROM teams ORDER BY team_id;';
			connection.query(statement, function(err, results) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot get teams.', error: err});
				} else {
					teamResults = results;
					cb1(null, null);
				}
			});
		},


	}, function(err) {
		if (err) {
			throw err;
		}
		for (var i = 0; i < teamResults.length; i++) {
			teamResults[i]['pr_score'] = powerRankings[i+1];
		}
		teamResults.sort(function(b,a) {return (a.pr_score > b.pr_score) ? 1 : ((b.pr_score > a.pr_score) ? -1 : 0);} );
		return res.json({execSuccess: true, data: teamResults});
	});
});

/* Populate all the old stats prior to a certain week */
router.get('/populatePastStats', function (req, res) {
	return populatePastStats(req, res);
});

/* Populate all the current week's stats */
router.get('/populateCurrentStats', function (req, res) {
	return populateCurrentStats(req, res);
});

/* Populate all the current weeks player stats */
router.get('/populateCurrentPlayerStats', function (req, res) {
	return populateCurrentPlayerStats(req, res);
});

// CRONjob to automatically run route updates every X interval
// currently set to every 4-11:30 in 30 minute increments
var job = new CronJob('00 00,30 16-23 * * 0-6', function() {
   		console.log("running current player cron");
		request('http://localhost:3000/populateCurrentPlayerStats', function (error, response, body) {
			if (!error && response.statusCode === 200) {
				console.log(body);
			} else {
				console.log(error);
			}
		});

		console.log("running current stat cron");
		request('http://localhost:3000/populateCurrentStats', function (error, response, body) {
			if (!error && response.statusCode === 200) {
				console.log(body);
			} else {
				console.log(error);
			}
		});
	},
	false,
	'America/Seattle'
);

function populatePastStats(req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/pastScoreScraper.py', {mode: 'json', args: [currentWeek, leagueId, seasonId] }, function(err, results) {
				if (err) {
					throw err;
				}

				console.log(JSON.stringify(results[0]));
				listOfStats = results[0];
				cb0(null, null);
			});
		}, 

		updateDb : function(cb1) {
			console.log(listOfStats);

			connection.beginTransaction(function(err) {
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
}

function populateCurrentStats(req, res) {
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

			var statement = 'REPLACE INTO baseball_stats SET ?';
			async.each(listOfStats, function(teamStatLine, callback) {
				console.log(teamStatLine);
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
}

// Populate function for current players statistics
function populateCurrentPlayerStats(req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/individualStatsScraper.py', {mode: 'json', args: [currentWeek, leagueId, seasonId, totalTeams] }, function(err, results) {
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

			var statement = 'REPLACE INTO player_stats SET ?';
			async.each(listOfStats, function(statLine, callback) {
				console.log(statLine);
				connection.query(statement, statLine, function(err) {
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
}



module.exports = router;