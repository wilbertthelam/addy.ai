var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

var async = require('async');

var loginAuth = require('./utilities/loginAuthenticationMiddleware.js');

var currentTime = require('./utilities/currentTime.js');


var week = currentTime.week;
console.log('current week as of now: ' + currentTime.week);
var year = currentTime.year;

/* GET to return all matchups with the user vote included */
router.get('/matchupsWithUserVote', loginAuth.isAuthenticated, function (req, res) {
	var finalData = [];
	var getListofMatchupIds = [];
	async.series({
		getMatchups: function (cb1) {
			var statement = 'SELECT t.team_name as team_name1, t2.team_name as team_name2, ' + 
				't.owner_name as owner_name1, t2.owner_name as owner_name2, m.* ' + 
				'FROM addy_ai_football.matchups m, addy_ai_football.teams t, addy_ai_football.teams t2 ' +
				'WHERE m.team_id1 = t.team_id AND m.team_id2 = t2.team_id ' +
				'AND t.league_id = m.league_id AND t2.league_id = m.league_id ' +
				'AND m.league_id = ? AND m.week = ? AND m.year = ?;';

			connection.query(statement, [req.query.leagueId, week, req.query.year], function (err, results) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot get matchup data.', error: err });
				}
				// console.log(JSON.stringify(results));
				finalData = results;
				return cb1(null, null);
			});
		},

		getListofMatchupIds: function (cb2) {
			for (var i = 0; i < finalData.length; i++) {
				getListofMatchupIds.push(finalData[i].matchup_id);
			}
			return cb2(null, null);
		},

		getVotes: function (cb2) {
			var statement = 'SELECT * FROM addy_ai_football.votes WHERE matchup_id in (?) AND user_id = ?;';

			connection.query(statement, [getListofMatchupIds, req.session.userId], function (err, results) {
				if (err) {
					return res.json({ execSuccess: false, message: 'Cannot get voting data.', error: err });
				}
				// console.log(JSON.stringify(results));

				var tempResults = {};

				for (var i = 0; i < results.length; i++) {
					tempResults[results[i].matchup_id] = results[i];
				}

				// loop through each element of finalData and add in voting data including: 
				// winning_team_id, losing_team_id, team_1_active, team_2_active
				// (active meaning if that team num won, thus allowing front end to know which one to highlight)
				
				for (var i = 0; i < finalData.length; i++) {
					var row = finalData[i];
					row.team_1_active = 0;
					row.team_2_active = 0;
					var matchupId = row.matchup_id;
					var tempResult = tempResults[matchupId];
					console.log('teamResult is: ');
					console.log(tempResult);

					if (tempResult != undefined && tempResult != null) {
						if (tempResult.winning_team_id === row.team_id1) {
							row.team_1_active = 1;
						} else if (tempResult.winning_team_id === row.team_id2) {
							row.team_2_active = 1;
						} else {
							console.log('weird error, both teams are marked as winners');
						}
					}
				}

				return res.json({ execSuccess: true, message: 'Matchup data with user vote successfully retrieved.', data: finalData });
			});
		}
	})
	
});

/* GET to return ALL matchups for a given leagueId. */
router.get('/matchups', function (req, res) {
	console.log('variable: ' + req.query.leagueId);
	var statement = 'SELECT t.team_name as team_name1, t2.team_name as team_name2, t.owner_name as owner_name1, t2.owner_name as owner_name2, m.* FROM addy_ai_football.matchups m, addy_ai_football.teams t, addy_ai_football.teams t2 WHERE m.team_id1 = t.team_id AND m.team_id2 = t2.team_id AND m.week = ? AND m.league_id = ? AND t.league_id = ? AND t2.league_id = ?;';
	connection.query(statement, [week, req.query.leagueId, req.query.leagueId, req.query.leagueId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get matchup data.', error: err });
		} else {
			console.log(JSON.stringify(results));
			return res.json({ execSuccess: true, message: 'Matchup data successfully retrieved.', data: results });
		}
	});
});

/* GET to return ALL user voters for a given matchupId. */
router.get('/votingPicksForUser', loginAuth.isAuthenticated, function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.votes WHERE user_id = ? AND matchup_id = ? LIMIT 1;';
	connection.query(statement, [req.session.userId, req.query.matchupId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get matchup data.', error: err });
		} else {
			console.log(JSON.stringify(results));
			return res.json({ execSuccess: true, message: 'Matchup data successfully retrieved.', data: results });
		}
	});
});

/* POST to add a users vote to the matchup for a given matchupId, winning_team_id and losing_team_id */
router.post('/vote', loginAuth.isAuthenticated, function (req, res) {
	connection.beginTransaction(function (err) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot begin transaction in vote route.', error: err});
		}
	});

	var statement = 'REPLACE INTO addy_ai_football.votes SET ?';
	var row = {
		matchup_id: req.body.matchupId,
		user_id: req.session.userId,
		winning_team_id: Number(req.body.winningTeamId),
		losing_team_id: Number(req.body.losingTeamId),
	};

	console.log(JSON.stringify(row));
	connection.query(statement, row, function(err) {
		if (err) {
			connection.rollback();
			return res.json({ execSuccess: false, message: 'Cannot insert into votes.', error: err});
		} else {
			connection.commit();
			return res.json({ execSuccess: true, message: 'Successfully submitted user vote', error: err});
		}
	});

});

router.get('/leaderboard', function (req, res) {
	// pass 

	var statement = 'SELECT count(*) as wins, ' + 
			'(SELECT count(*) FROM addy_ai_football.matchups m2 WHERE m2.league_id = m.league_id AND m2.week < ?) - count(*) as losses, ' +
			'count(*) / (SELECT count(*) FROM addy_ai_football.matchups m2 WHERE m2.league_id = m.league_id AND m2.week < ?) as win_percentage, ' +
	 		'v.user_id, ' + 
	 		'm.league_id, ' + 
	 		'm.year, ' +
	 		'u.first_name, ' +
	 		'u.last_name, ' +
	 		'u.email ' +
		'FROM addy_ai_football.votes v, addy_ai_football.matchups m, addy_ai_football.results r, addy_ai_football.users u ' +
		'WHERE v.winning_team_id = r.winning_team_id ' +
		'AND m.matchup_id = v.matchup_id ' +
		'AND v.matchup_id = r.matchup_id ' +
		'AND u.user_id = v.user_id ' +
		'AND m.week < ? ' +
		'AND m.league_id = ? ' +
		'AND m.year = ? ' +
		'GROUP BY v.user_id ' +
		'ORDER BY wins DESC, win_percentage DESC;';

	// input into query are (in order)
	connection.query(statement, [week, week, week, req.query.leagueId, req.query.year], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get leaderboard data.', error: err });
		} else {
			console.log(JSON.stringify(results));
			return res.json({ execSuccess: true, message: 'Leaderboard data successfully retrieved.', data: results });
		}
	});
});




module.exports = router;
