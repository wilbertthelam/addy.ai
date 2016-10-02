var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

var loginAuth = require('./utilities/loginAuthenticationMiddleware.js');

/* GET to return ALL matchups for a given leagueId. */
router.get('/matchups', function (req, res) {
	console.log('variable: ' + req.query.leagueId);
	var statement = 'SELECT t.team_name as team_name1, t2.team_name as team_name2, t.owner_name as owner_name1, t2.owner_name as owner_name2, m.* FROM addy_ai_football.matchups m, addy_ai_football.teams t, addy_ai_football.teams t2 WHERE m.team_id1 = t.team_id AND m.team_id2 = t2.team_id AND m.week = 1 AND m.league_id = ?;';
	connection.query(statement, req.query.leagueId, function (err, results) {
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
	var statement = 'SELECT * FROM addy_ai_football.votes WHERE user_id = ? AND matchup_id = ?;';
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




module.exports = router;
