var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;

var async = require('async');

var moment = require('moment');
moment().format();

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

// league information
var leagueId = 44067;
var seasonId = 2016;
var totalTeams = 8;

// current week MANUALLY SET FOR NOW
// var currentWeek = 10;
var currentWeek = calculateWeek();

// calculate current week of game
function calculateWeek() {
	var now = moment().valueOf();
	var start = moment(seasonId + "-04-03").valueOf();

	console.log("first time = " + now.valueOf());
	console.log("second tiem = " + start.valueOf());

	var oneWeek = 1000*60*60*24*7;

	var diff = now - start;
	console.log("wee= " + diff / oneWeek);
	return Math.floor(diff / oneWeek) + 1; 
};



//=====================
// localcache variables
//=====================
var scoreboard = null;
var powerRankings = null;
 // intended to be stored in form {'batters': {xxx}, 'pitchers': {xxx}}
var topPlayersCache = [];


/* GET home page. */
router.get('/', function (req, res) {
	res.render('index', { title: 'addy.ai' });
});

/* GET news page. */
router.get('/news', function (req, res) {
	res.render('index', { title: 'addy.ai' });
});

/* GET to create an editor. */
router.get('/createEditor', function (req, res) {
	// create article in db, then allow it to be edited
	var statement = 'INSERT INTO articles SET ?;';
	connection.query(statement, [{ author_id: 1 }], function (err, results) {
		if (err) {
			throw err;
		} else {
			console.log(results.insertId);
			res.redirect('/editor?articleId=' + results.insertId);
		}
	});
});

router.get('/editor', function (req, res) {
	res.render('index', { title: 'addy.ai' });
});

/* GET current week variable from server */
router.get('/currentWeek', function (req, res) {
	return res.json({ execSuccess: true, data: { week: currentWeek } });
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

/* GET given week stats information */
router.get('/weeklyTeamStats', function (req, res) {
	var statement = 'SELECT * FROM statv WHERE week = ? AND league_id = ? AND year = ?;';
	connection.query(statement, [req.query.week, leagueId, seasonId], function(err, results) {
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
router.get('/weeklyPlayerStats', function (req, res) {
	var statement = 'SELECT * FROM weekly_player_statv WHERE week = ? AND league_id = ? AND season_id = ?;';
	connection.query(statement, [req.query.week, leagueId, seasonId], function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get stats.', error: err});
		} else {
			return res.json({ execSuccess: true, message: 'Stats successfully retrieved.', data: results});
		}
	});
});

/* GET current player week stats information by position and stat category, limited to top 20. */
router.get('/topWeeklyPlayerStats', function (req, res) {
	var statement = 'SELECT * FROM weekly_player_statv WHERE week = ?'
		+ ' AND league_id = ? AND season_id = ?'
		// + ' AND (player_position = ? OR player_position2 = ? OR player_position3 = ?)'
		+ ' ORDER BY ' + req.query.category + ' DESC LIMIT 20;';
	connection.query(statement, [req.query.week, leagueId, seasonId, req.query.position, req.query.position, req.query.position], function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get top player stats.', error: err});
		} else {
			return res.json({ execSuccess: true, message: 'Top player stats successfully retrieved.', data: results});
		}
	});
});


// /* Get top player and store in cache */
function cacheTopPlayers(type, week, leagueId, seasonId, position, category, callback) {
	// since this cache needs to store both top batters and top pitchers, need to make sure we assign
	// to correct cache variable
	PythonShell.run('./topplayeralgo.py',
		{ mode: 'json', args: [week, leagueId, seasonId, position, category] }, function (err, results) {
		// type is either 'batters' or 'pitchers'
		if (err) {
			topPlayersCache[week][type] = { execSuccess: false, message: 'Failed to retrieve batters players', data: {} };
		} else {
			topPlayersCache[week][type] = { execSuccess: true, message: 'Successfully retrieved top players', data: results[0] };
		}
		callback();
	});
}

/* Calculate top player */
router.get('/topPlayers', function (req, res) {
	var position = req.query.position;
	var week = Number(req.query.week);
	var type = 'batters';
	if (position.toLowerCase() === 'rp' || position.toLowerCase() === 'sp') {
		type = 'pitchers';
	}

	if (!topPlayersCache[week] || !topPlayersCache[week][type]) {
		if (!topPlayersCache[week]) {
			topPlayersCache[week] = {};
		}
		console.log('create cache for batter & pitcher MVP');
		cacheTopPlayers(type, week, leagueId, seasonId, position, req.query.category, function () {
			return res.json(topPlayersCache[week][type]);
		});
	} else {
		console.log('get cache for batter & pitcher MVP');
		return res.json(topPlayersCache[week][type]);
	}
});


/* Get scoreboard ticker scores and store in cache */
function saveScoreboard(callback) {
	// take in req.query.position
	//			req.query.category
	PythonShell.run('./scraper/liveMatchupScoreScraper.py',
		{ mode: 'json', args: [currentWeek, leagueId, seasonId] }, function (err, results) {
		if (err) {
			scoreboard = { execSuccess: false, message: 'Failed to retrieve current scores', data: {} };
		} else {
			scoreboard = { execSuccess: true, message: 'Successfully retrieved current scores', data: results[0] };
		}
		callback();
	});
};

/* GET scoreboard data */
router.get('/scoreboard', function (req, res) {
	if (scoreboard === null) {
		saveScoreboard(function () {
			return res.json(scoreboard);
		});
	} else {
		return res.json(scoreboard);
	}
});



/* Calculate power rankings*/
function cachePowerRankings(totalTeams, currentWeek, callback) {
	// run python web scraper and return data as JSON
	var powerRankings2;
	var teamResults;
	async.series({
		runPyScript: function(cb0) {
			PythonShell.run('./pralgo.py', {mode: 'json', args: [totalTeams, currentWeek] }, function (err, results) {
				if (err) {
					throw err;
				}

				//console.log(JSON.stringify(results[0]));
				powerRankings2 = results[0];
				cb0(null, null);
			});
		},

		getTeams: function(cb1) {
			var statement = 'SELECT * FROM teams ORDER BY team_id;';
			connection.query(statement, function (err, results) {
				if (err) {
					powerRankings = ({ execSuccess: false, message: 'Cannot get teams.', error: err});
					return callback();
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
			teamResults[i]['pr_score'] = powerRankings2[i+1];
		}
		teamResults.sort(function (b,a) {
			return (a.pr_score > b.pr_score) ? 1 : ((b.pr_score > a.pr_score) ? -1 : 0);
		});
		powerRankings = { execSuccess: true, data: teamResults };
		return callback();
	});
}

/* Calculate power rankings */
router.get('/powerRankings', function (req, res) {
	if (powerRankings === null) {
		cachePowerRankings(totalTeams, currentWeek, function () {
			return res.json(powerRankings);
		});
	} else {
		return res.json(powerRankings);
	}
});


/* Populate all the old stats prior to a certain week */
router.get('/populatePastStats', function (req, res) {
	return populatePastStats(req, res);
});

/* Populate all the current week's stats */
router.get('/populateCurrentStats', function (req, res, next) {
	return populateCurrentStats(req, res);
});

/* Populate all the current weeks player stats */
router.get('/populateCurrentPlayerStats', function (req, res) {
	return populateCurrentPlayerStats(req, res);
});

function populatePastStats(req, res) {
	// run python web scraper and return data as JSON
	var listOfStats;
	
	async.series({
		runPyScript : function(cb0) {
			PythonShell.run('./scraper/pastScoreScraper.py', {mode: 'json', args: [currentWeek, leagueId, seasonId] }, function(err, results) {
				if (err) {
					throw err;
				}

				// console.log(JSON.stringify(results[0]));
				listOfStats = results[0];
				cb0(null, null);
			});
		}, 

		updateDb : function(cb1) {
			// console.log(listOfStats);

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
			// console.log(listOfStats);
			
			connection.beginTransaction(function(err){
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
					return res.json({ execSuccess: false, message: 'Cannot close transaction.', error: err });
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
		cachePowerRankings(totalTeams, currentWeek, function() {});
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
			// console.log(listOfStats);
			
			connection.beginTransaction(function(err){
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot begin transaction.', error: err});
				}
			});

			var statement = 'REPLACE INTO player_stats SET ?';
			async.each(listOfStats, function(statLine, callback) {
				// console.log(statLine);
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