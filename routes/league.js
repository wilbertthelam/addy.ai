var express = require('express');
var router = express.Router();

var loginAuth = require('./utilities/loginAuthenticationMiddleware.js');

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

var async = require('async');

var currentTime = require('./utilities/currentTime.js');


var week = currentTime.week;
var year = currentTime.year;


/* GET to return ALL leagues that a user is in. */
router.get('/userLeagues', loginAuth.isAuthenticated, function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.user_leagues ul, addy_ai_football.leagues l WHERE user_id = ? and ul.league_id = l.league_id ORDER BY l.league_name;';
	connection.query(statement, req.session.userId, function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get user leagues.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'User leagues successfully retrieved.', data: results });
		}
	});
});

/* GET leagues the user isn't in. */
router.get('/availableLeagues', loginAuth.isAuthenticated, function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.leagues WHERE league_id NOT IN ( SELECT league_id FROM addy_ai_football.user_leagues WHERE user_id = ?) ORDER BY league_name;';
	connection.query(statement, [req.session.userId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get leagues.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Leagues successfully retrieved.', data: results });
		}
	});
});

/* POST to add a league to the users list */
router.post('/addLeagueForUser', loginAuth.isAuthenticated, function (req, res) {
	connection.beginTransaction(function (err) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot begin transaction in vote route.', error: err });
		}
	});

	var statement = 'INSERT INTO addy_ai_football.user_leagues SET ?';
	var row = {
		league_id: req.body.leagueId,
		user_id: req.session.userId
	};

	console.log(JSON.stringify(row));
	connection.query(statement, row, function(err) {
		if (err) {
			connection.rollback();
			return res.json({ execSuccess: false, message: 'Cannot insert into user leagues.', error: err });
		} else {
			connection.commit();
			return res.json({ execSuccess: true, message: 'Successfully added a league to the user', error: err});
		}
	});

});

/* GET info on a league that the user is in. */
router.get('/leagueInfo', function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.leagues WHERE league_id = ?;';
	connection.query(statement, [req.query.leagueId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get league.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'League successfully retrieved.', data: results });
		}
	});
});

/* GET info on a league that the user is in. */
router.get('/leagueInfoESPNSeason', loginAuth.isAuthenticated, function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.leagues WHERE espn_id = ? AND year = ?;';
	connection.query(statement, [req.query.espnId, year], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get league.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'League successfully retrieved.', data: results });
		}
	});
});

/* GET info on a user. */
router.get('/user', loginAuth.isAuthenticated, function (req, res) {
	var statement = 'SELECT user_id, email, first_name, last_name, create_time FROM addy_ai_football.users WHERE user_id = ?;';
	connection.query(statement, [req.session.userId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get user information.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'User information successfully retrieved.', data: results });
		}
	});
});



module.exports = router;
