/* global gYear gWeek:true */
/* eslint no-undef: "error" */

var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

var async = require('async');

var loginAuth = require('./utilities/loginAuthenticationMiddleware.js');
var leagueLock = require('./utilities/leagueLockedMiddleware.js');

// console.log('Current week as of now: ' + gWeek);

/* GET to return all matchups with the user vote included */
router.get('/matchupsWithUserVote', loginAuth.isAuthenticated, function (req, res) {
	var finalData = [];
	var getListofMatchupIds = [];
	async.series({
		getMatchups: function (cb) {
			var statement = 'SELECT t.team_name as team_name1, t2.team_name as team_name2, ' +
				't.owner_name as owner_name1, t2.owner_name as owner_name2, m.*, lvs.locked, ' +
				'null as actual_winner_id, null as actual_loser_id, ' +
				'null as actual_winning_score, null as actual_losing_score ' +
				'FROM addy_ai_football.matchups m, addy_ai_football.teams t, ' +
				'addy_ai_football.teams t2, addy_ai_football.league_voting_status lvs ' +
				'WHERE m.team_id1 = t.team_id AND m.team_id2 = t2.team_id ' +
			'AND t.league_id = m.league_id AND t2.league_id = m.league_id ' +
			'AND m.league_id = ? AND m.week = ? AND m.year = ? ' +
			'AND lvs.year = m.year AND lvs.week = m.week;';

			var params = [
				req.query.leagueId,
				req.query.week,
				req.query.year
			];

			connection.query(statement, params, function (err, results) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'Cannot get matchup data.',
						error: err
					});
				}
				// // console.log(JSON.stringify(results));
				finalData = results;
				return cb(null, null);
			});
		},

		getListofMatchupIds: function (cb1) {
			for (var i = 0; i < finalData.length; i++) {
				getListofMatchupIds.push(finalData[i].matchup_id);
			}
			return cb1(null, null);
		},

		getVotes: function (cb2) {
			var statement = 'SELECT * FROM addy_ai_football.votes ' +
				'WHERE matchup_id in (?) AND user_id = ?;';

			var params = [
				getListofMatchupIds,
				req.session.userId
			];
			connection.query(statement, params, function (err, results) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'Cannot get voting data.',
						error: err
					});
				}
				// // console.log(JSON.stringify(results));

				var tempResults = {};

				for (var i = 0; i < results.length; i++) {
					tempResults[results[i].matchup_id] = results[i];
				}

				// loop through each element of finalData and add in voting data including:
				// winning_team_id, losing_team_id, team_1_active, team_2_active
				// (active meaning if that team num won,
				// thus allowing front end to know which one to highlight)

				for (var j = 0; j < finalData.length; j++) {
					var row = finalData[j];
					row.team_1_active = 0;
					row.team_2_active = 0;
					row.winning_team_id = null;
					row.losing_team_id = null;
					var matchupId = row.matchup_id;
					var tempResult = tempResults[matchupId];
					// console.log('teamResult is: ');
					// console.log(tempResult);

					if (tempResult != undefined && tempResult != null) {
						if (tempResult.winning_team_id === row.team_id1) {
							row.team_1_active = 1;
							row.winning_team_id = row.team_id1;
							row.losing_team_id = row.team_id2;
						} else if (tempResult.winning_team_id === row.team_id2) {
							row.team_2_active = 1;
							row.winning_team_id = row.team_id2;
							row.losing_team_id = row.team_id1;
						} else {
							// console.log('weird error, both teams are marked as winners');
						}
					}
				}

				return cb2(null, null);
			});
		},

		getResults: function () {
			var statement = 'SELECT * FROM addy_ai_football.results WHERE matchup_id in (?);';

			connection.query(statement, [getListofMatchupIds], function (err, results) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'Cannot get voting result data.',
						error: err
					});
				}
				// // console.log(JSON.stringify(results));

				var tempResults = {};
				if (results.length > 0 || results != null) {
					for (var i = 0; i < results.length; i++) {
						tempResults[results[i].matchup_id] = results[i];
					}

					// loop through each element of finalData and add in voting data including:
					// winning_team_id, losing_team_id, team_1_active, team_2_active
					// (active meaning if that team num won, thus allowing
					// front end to know which one to highlight)

					for (var j = 0; j < finalData.length; j++) {
						var row = finalData[j];

						var matchupId = row.matchup_id;
						var tempResult = tempResults[matchupId];
						if (tempResult != undefined && tempResult != null) {
							row.actual_winner_id = tempResult.winning_team_id;
							row.actual_loser_id = tempResult.losing_team_id;
							row.actual_winning_score = tempResult.winning_team_score;
							row.actual_losing_score = tempResult.losing_team_score;
						}
					}
				}

				return res.json({
					execSuccess: true,
					message: 'Matchup data with user vote successfully retrieved.',
					data: finalData
				});
			});
		}
	});
});

/* GET to return ALL matchups for a given leagueId. */
router.get('/matchups', function (req, res) {
	// console.log('variable: ' + req.query.leagueId);
	var statement = 'SELECT t.team_name as team_name1, t2.team_name as team_name2, ' +
		't.owner_name as owner_name1, t2.owner_name as owner_name2, m.* ' +
		'FROM addy_ai_football.matchups m, addy_ai_football.teams t, ' +
		'addy_ai_football.teams t2 WHERE m.team_id1 = t.team_id AND m.team_id2 = t2.team_id ' +
		'AND m.week = ? AND m.league_id = ? AND t.league_id = ? AND t2.league_id = ?;';

	var params = [
		gWeek,
		req.query.leagueId,
		req.query.leagueId,
		req.query.leagueId
	];
	connection.query(statement, params, function (err, results) {
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Cannot get matchup data.',
				error: err
			});
		}
		// console.log(JSON.stringify(results));
		return res.json({
			execSuccess: true,
			message: 'Matchup data successfully retrieved.',
			data: results
		});
	});
});

/* GET to return ALL user voters for a given matchupId. */
router.get('/votingPicksForUser', loginAuth.isAuthenticated, function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.votes ' +
		'WHERE user_id = ? AND matchup_id = ? LIMIT 1;';

	connection.query(statement, [req.session.userId, req.query.matchupId], function (err, results) {
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Cannot get matchup data.',
				error: err });
		}
		// console.log(JSON.stringify(results));
		return res.json({
			execSuccess: true,
			message: 'Matchup data successfully retrieved.',
			data: results
		});
	});
});

/* POST to add a users vote to the matchup for a given
	matchupId, winning_team_id and losing_team_id */
router.post('/vote', loginAuth.isAuthenticated, leagueLock.isUnlocked(), function (req, res) {
	connection.beginTransaction(function (err) {
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Cannot begin transaction in vote route.',
				error: err
			});
		}
	});

	var statement = 'REPLACE INTO addy_ai_football.votes SET ?';
	var row = {
		matchup_id: req.body.matchupId,
		user_id: req.session.userId,
		winning_team_id: Number(req.body.winningTeamId),
		losing_team_id: Number(req.body.losingTeamId),
	};

	// console.log(JSON.stringify(row));
	connection.query(statement, row, function (err) {
		if (err) {
			connection.rollback();
			return res.json({
				execSuccess: false,
				message: 'Cannot insert into votes.',
				error: err
			});
		}
		connection.commit();
		return res.json({
			execSuccess: true,
			message: 'Successfully submitted user vote',
			error: err
		});
	});
});

/* GET cumulative leadeboard for a given league */
router.get('/cumulativeLeaderboard', function (req, res) {
	var statement = 'SELECT count(*) as wins, ' +
			'(SELECT count(*) ' +
				'FROM addy_ai_football.votes v, addy_ai_football.matchups m2, ' +
				'addy_ai_football.results r, addy_ai_football.users u2 ' +
				'WHERE v.winning_team_id != r.winning_team_id ' +
				'AND m2.matchup_id = v.matchup_id ' +
				'AND v.matchup_id = r.matchup_id ' +
				'AND u2.user_id = v.user_id ' +
				'AND m2.week < ? ' +
				'AND m2.league_id = ? ' +
				'AND m2.year = ? ' +
				'AND u2.user_id = u.user_id ' +
				'GROUP BY v.user_id ' +
				') as losses, ' +
			'v.user_id, ' +
			'm.league_id, ' +
			'm.year, ' +
			'u.first_name, ' +
			'u.last_name, ' +
			'u.email ' +
		'FROM addy_ai_football.votes v, addy_ai_football.matchups m, ' +
		'addy_ai_football.results r, addy_ai_football.users u ' +
		'WHERE v.winning_team_id = r.winning_team_id ' +
		'AND m.matchup_id = v.matchup_id ' +
		'AND v.matchup_id = r.matchup_id ' +
		'AND u.user_id = v.user_id ' +
		'AND m.week < ? ' +
		'AND m.league_id = ? ' +
		'AND m.year = ? ' +
		'GROUP BY v.user_id ' +
		'ORDER BY wins DESC, losses ASC;';

	// input into query are (in order)
	var params = [
		gWeek,
		req.query.leagueId,
		req.query.year,
		gWeek,
		req.query.leagueId,
		req.query.year
	];

	connection.query(statement, params, function (err, results) {
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Cannot get leaderboard data.',
				error: err
			});
		}
		// // console.log(JSON.stringify(results));
		// calculate win percentage
		for (var i = 0; i < results.length; i++) {
			var result = results[i];
			var winPercNum = Number(result.wins / (result.wins + result.losses));
			result['win_percentage'] = winPercNum.toPrecision(3);
		}
		return res.json({
			execSuccess: true,
			message: 'Leaderboard data successfully retrieved.',
			data: results
		});
	});
});

/* GET to find leaderboard results for the logged in user */
router.get('/leaderboardForUser', function (req, res) {
	var statement = 'SELECT count(*) as wins, ' +
			'(SELECT count(*) FROM addy_ai_football.votes v, addy_ai_football.matchups m2, ' +
				'addy_ai_football.results r, addy_ai_football.leagues l, ' +
				'addy_ai_football.user_leagues u2 ' +
				'WHERE v.winning_team_id != r.winning_team_id ' +
				'AND m2.matchup_id = v.matchup_id ' +
				'AND v.matchup_id = r.matchup_id ' +
				'AND m2.week < ? ' +
				'AND m2.league_id = l.league_id ' +
				'AND m2.year = ? ' +
				'AND v.user_id = ? ' +
				'AND v.user_id = u2.user_id ' +
				'AND u2.league_id = m2.league_id ' +
				'AND u.league_id = u2.league_id ' +
				'GROUP BY m2.league_id and m2.year) as losses, ' +
			'v.user_id, ' +
			'm.league_id, ' +
			'm.year, ' +
			'l.league_name ' +
		'FROM addy_ai_football.votes v, addy_ai_football.matchups m, addy_ai_football.results r, ' +
		'addy_ai_football.leagues l, addy_ai_football.user_leagues u ' +
		'WHERE v.winning_team_id = r.winning_team_id ' +
		'AND m.matchup_id = v.matchup_id ' +
		'AND v.matchup_id = r.matchup_id ' +
		'AND m.week < ? ' +
		'AND m.league_id = l.league_id ' +
		'AND m.year = ? ' +
		'AND v.user_id = ? ' +
		'AND v.user_id = u.user_id ' +
		'AND u.league_id = m.league_id ' +
		'GROUP BY m.league_id ' +
		'ORDER BY wins DESC, losses ASC;';

	// input into query are (in order)
	var params = [
		gWeek,
		req.query.year,
		req.session.userId,
		gWeek,
		req.query.year,
		req.session.userId
	];
	connection.query(statement, params, function (err, results) {
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Cannot get profile leaderboard data.',
				error: err
			});
		}
		// console.log(JSON.stringify(results));
		for (var i = 0; i < results.length; i++) {
			var result = results[i];
			var winPercNum = Number(result.wins / (result.wins + result.losses));
			result['win_percentage'] = winPercNum.toPrecision(3);
		}
		return res.json({
			execSuccess: true,
			message: 'Profile leaderboard data successfully retrieved.',
			data: results
		});
	});
});

/* GET to find leaderboard results for a league in a given week */
router.get('/leaderboardByWeek', function (req, res) {
	var statement = 'SELECT count(*) as wins, ' +
			'(SELECT count(*) FROM addy_ai_football.matchups m2 WHERE m2.league_id = m.league_id ' +
				'AND m2.week = ?) - count(*) as losses, ' +
			'count(*) / (SELECT count(*) FROM addy_ai_football.matchups m2 ' +
				'WHERE m2.league_id = m.league_id AND m2.week = ?) as win_percentage, ' +
			'v.user_id, ' +
			'm.league_id, ' +
			'm.year, ' +
			'u.first_name, ' +
			'u.last_name, ' +
			'u.email ' +
		'FROM addy_ai_football.votes v, addy_ai_football.matchups m, ' +
			'addy_ai_football.results r, addy_ai_football.users u ' +
		'WHERE v.winning_team_id = r.winning_team_id ' +
		'AND m.matchup_id = v.matchup_id ' +
		'AND v.matchup_id = r.matchup_id ' +
		'AND u.user_id = v.user_id ' +
		'AND m.week = ? ' +
		'AND m.league_id = ? ' +
		'AND m.year = ? ' +
		'GROUP BY v.user_id ' +
		'ORDER BY wins DESC, win_percentage DESC;';

	// input into query are (in order)
	var params = [req.query.week,
		req.query.week,
		req.query.week,
		req.query.leagueId,
		req.query.year
	];
	connection.query(statement, params, function (err, results) {
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Cannot get leaderboard weekly data.',
				error: err
			});
		}
		// console.log(JSON.stringify(results));
		return res.json({
			execSuccess: true,
			message: 'Leaderboard weekly data successfully retrieved.',
			data: results
		});
	});
});


module.exports = router;
