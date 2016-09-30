var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

/* GET to return ALL leagues that a user is in. */
router.get('/userLeagues', function (req, res) {
	var statement = 'SELECT * FROM addy_ai_football.user_leagues ul, addy_ai_football.leagues l WHERE user_id = ? and ul.league_id = l.league_id;';
	connection.query(statement, req.session.userId, function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get articles.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Articles successfully retrieved.', data: results });
		}
	});
});

/* GET to return single article by id. */
router.get('/leagues', function (req, res) {
	var statement = 'SELECT * FROM articles WHERE article_id = ? ORDER BY update_time DESC;';
	connection.query(statement, [req.query.articleId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get articles.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Articles successfully retrieved.', data: results });
		}
	});
});

module.exports = router;
