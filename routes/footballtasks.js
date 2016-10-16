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

var currentTime = require('./utilities/currentTime.js');

var week = currentTime.week;
var year = currentTime.year;

// function to do the lock for the league on a given week/year
function lock(userId, week, year, lock, callback) {
	if (userId !== 1) {
		return callback({ execSuccess: false, message: 'Only Wilbert can change the lock status.', error: err });
	}

	connection.beginTransaction(function (err) {
		if (err) {
			return callback({ execSuccess: false, message: 'Cannot begin transaction in changeLockStatus route.', error: err });
		}
	});

	var statement = 'UPDATE addy_ai_football.league_voting_status SET ? WHERE week = ? AND year = ?;';
	var row = {
		locked: lock,
	};

	console.log(JSON.stringify(row));
	connection.query(statement, [row, week, year], function(err) {
		if (err) {
			connection.rollback();
			return callback({ execSuccess: false, message: 'Cannot change lock status.', error: err });
		} else {
			connection.commit();
			return callback({ execSuccess: true, message: 'Successfully changed lock status', error: err });
		}
	});
}

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
	var leagueName;
	// var seasonId = req.body.seasonId;
	var seasonId = year;
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
					leagueName = infoData.league.league_name;
					console.log('updateDbLeague is: ' + leagueId);
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
				connection.query(statement, row, function (err) {
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
					res.json({ execSuccess: true, message: 'Added league to the database.', data: { league_id: leagueId, league_name: leagueName } });
				}
			});
		},
	}, function(err) {
		if (err) {
			throw err;
		}
		return res.json({ execSuccess: true, message: 'Reached the end of database update.' });
	});
});


// POST to populate the database with results for a given week
// 1. Get all the leagueIds
// 2. For each leagueId, run the Python script to get the results
// 3. If it cannot get results, then add the leagueId to the list of non working leagues
// 4. Take working results and populate the database
// 5. Return success and the leagues that don't work in response
router.post('/populateLeagueResults', loginAuth.isAuthenticated, function (req, res) {
	var idList = []; // array with each element being an object with espnId and leagueId
	var workingLeaguesData = [];
	var nonWorkingLeaguesList = [];

	var localYear = req.body.year;
	var localWeek = req.body.week;

	if (req.session.userId !== 1) {
		return res.json({ execSuccess: false, message: 'Only Wilbert can close league results.' });
	}

	async.series({
		lockLeagues: function (cb) {
			lock(req.session.userId, localWeek, localYear, 1, function (data) {
				if (data.execSuccess === true) {
					return cb(null, null);
				} else {
					return res.json(data);
				}
			});
		},
		getLeagueIds: function (cb0) {
			var statement = 'SELECT league_id, espn_id FROM addy_ai_football.leagues;';
			connection.query(statement, function (err, results) {
				if (err) {
					return res.json({ execSuccess: false, message: 'DB error in getLeagueIds.', error: err });
				}

				//console.log(JSON.stringify(results));
				if (!results || results.length < 1) {
					console.log('No leagues exists');
					return res.json({ execSuccess: false, message: 'No leagues exist.', code: 'ERR_NO_LEAGUE', data: [] });
				}
				idList = JSON.stringify(results);
				//console.log(idList);
				return cb0(null, 'League available');
			});
		},
		getLeagueResults: function (cb1) {
			PythonShell.run('./scraper/footballResultsScraper.py', { mode: 'json', args: [idList, localYear, localWeek] }, function (err, results) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Could not parse league result data.', code: 'ERR_PRIVATE_NOT_EXIST', error: err });
				}

				// console.log('All matchups: ' + JSON.stringify(results[0]));
				var infoData = results[0];
				workingLeaguesData = infoData['leagueData'];
				nonWorkingLeaguesList = infoData['invalidLeagues'];

				console.log('non working: ' + nonWorkingLeaguesList);
				return cb1(null, null);
			});
		},
		getMatchupId: function (cb2) {
			var statement = 'SELECT matchup_id FROM addy_ai_football.matchups WHERE league_id = ? AND week = ? '
				+ 'AND team_id1 in (?, ?) AND team_id2 in (?, ?) LIMIT 1;';

			console.log('week: ' + week)
			async.each(workingLeaguesData, function (row, callback) {
				connection.query(statement, [row.league_id, week, row.winning_team_id, row.losing_team_id, row.winning_team_id, row.losing_team_id], function (err, results) {
					console.log('results: ' + JSON.stringify(results) + ' for league: ' + row.league_id);
					var errorMessage = '';
					if (err) {
						errorMessage = 'DB error in getMatchupId.';
						return callback(errorMessage);
					}

					// console.log('result stuff: ' + JSON.stringify(results));
					// console.log('row stuff: ' + JSON.stringify(row))
					if (!results || results.length < 1) {
						console.log('No matchup exists for: ' + row.league_id);
						errorMessage = 'No matchup exist.';
						return callback(errorMessage);
					}
					row['matchup_id'] = results[0].matchup_id;
					//console.log(row);
					return callback();
				});
			}, function (err) {
				if (err) {
					return res.json({ execSuccess: false, message: err });
				}

				return cb2(null, null);
			});
			//cb2(null, null);

		},

		insertIntoResults: function (cb3) {
			connection.beginTransaction(function(err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});

			var statement = 'REPLACE INTO addy_ai_football.results SET ?';
			async.each(workingLeaguesData, function(row, callback) {
				// console.log(teamStatLine);
				delete row.league_id;
				delete row.espn_id;
				connection.query(statement, row, function(err) {
					if (err) {
						connection.rollback();
						return callback(err);
					} else {
						return callback();
					}
				});
			}, function(err) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot close transaction.', error: err});
				} else {
					connection.commit();
					return res.json({ execSuccess: true, message: 'Successfully updated database.', data: nonWorkingLeaguesList });
				}
			});
		}

	});
});

/* POST for admin to change the lock status at the moment */
router.post('/changeLockStatus', loginAuth.isAuthenticated, function (req, res) {
	lock(req.session.userId, req.body.week, req.body.year, req.body.locked, function (result) {
		return res.json(result);
	});
});

/* GET time. */
router.get('/currentTime', loginAuth.isAuthenticated, function (req, res) {
	var data = {
		week: week,
		year: year
	};
	return res.json({ execSuccess: true, message: 'Current time successfully retrieved.', data: data });
});


module.exports = router;