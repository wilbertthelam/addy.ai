/* global gYear gWeek:true */
/* eslint no-undef: "error" */

// pass connection for db
var db = require('../../db_conn_football.js');
var connection = db;


function updateVoteNotif(io, data) {
	console.log(data.userId + ' is logged in');

	var statement = 'SELECT ' +
	'(SELECT count(*) FROM addy_ai_football.matchups m, addy_ai_football.votes v ' +
	'WHERE m.league_id = ? AND m.week = ? AND m.year = ? ' +
	'AND v.matchup_id = m.matchup_id and v.user_id = ? GROUP BY league_id, week, year) = ' +
	'(SELECT count(*) FROM addy_ai_football.matchups ' +
	'WHERE league_id = ? AND week = ? AND year = ?) as filled_out;';

	const params = [
		data.leagueId,
		gWeek,
		gYear,
		data.userId,
		data.leagueId,
		gWeek,
		gYear
	];
	connection.query(statement, params, function (err, results) {
		if (!err) {
			console.log('Retrieved result for voting notification for league ' + data.leagueId);

			var newResult = results[0].filled_out;
			console.log(newResult);
			if (newResult == null) {
				newResult = 0;
			}
			console.log('Result for socket retrieve: ' + newResult);
			// emit 0 if there are votes left, 1 if user voted on everything
			io.emit('voteNotif', {
				leagueId: data.leagueId,
				result: newResult
			});
		}
	});
}

module.exports = function (io) {
	// socket to keep track of whether a vote has been filled or not
	io.on('connection', function (socket) {
		console.log('User connected to the socket.');
		// updateVoteNotif(io, {userId: 1, leagueId: });
		// when the user selects a vote, check to see if theres still voting notification to be shown
		socket.on('voteNotif', function (data) {
			updateVoteNotif(io, data);
		});
	});
};
