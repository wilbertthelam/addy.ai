var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

/* GET to return ALL articles. */
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


module.exports = router;
