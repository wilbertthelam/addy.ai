/* weekly_variables.js
Hold's the global variables that determine the following:
	leagueId -> TODO: change it to be front end determined
	seasonId -> TODO: change it to be front end determined
	currentWeek of leagues
		TODO: Figure out how to determine week if it doesn't start
			on week 1
*/

var moment = require('moment');
moment().format();

var seasonId = 2016;
var leagueId = 44067;

var variables = {
	// calculate current week of game
	currentWeek: calculateWeek(seasonId),
	seasonId: seasonId,
	leagueId: leagueId
};

function calculateWeek(seasonId) {
	var now = moment();
	var start = moment(seasonId + "-04-04");

	var oneWeek = 1000*60*60*24*7;

	var diff = now - start;
	// console.log("week = " + (Math.floor(diff / oneWeek) + 1));
	return Math.floor(diff / oneWeek) + 1; 
};

module.exports = variables;