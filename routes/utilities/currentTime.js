// pass connection for db
var db = require('../../db_conn_football.js');
var connection = db;

var week = 4;
var year = 2016;



// CRONjob to automatically increment week on Tuesday 12am PST
// 00 00 00 * * 2
// var CronJob = require('cron').CronJob;
// var job = new CronJob('0,5,10,15,20,25,30,35,40,45,50,55 00-10 23 * * 5', function () {
//    		console.log("Next week started: " + (week + 1));
// 				/* GET info on a league that the user is in. */
// 		var statement = 'UPDATE addy_ai_football.time SET ? WHERE time_id = 1;';
// 		connection.query(statement, [{week: week+1}], function (err, results) {
// 			if (err) {
// 				console.log('Week failed to update');
// 			} else {
// 				week++;
// 			}
// 		});
// 	},
// 	false,
// 	'America/Seattle'
// );


module.exports = {
	week: week,
	year: year
};
