var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;

// cronjob to update the database
var CronJob = require('cron').CronJob;
var request = require('request');

// create Python shell to allow us to run web scraper
var PythonShell = require('python-shell');

// CRONjob to automatically run route updates every X interval
// currently set to every 4-11:30 in 30 minute increments
var job = new CronJob('00 00,30 15-23 * * 0-6', function () {
   		console.log("running current player cron");
		request('https://addyai.herokuapp.com/populateCurrentPlayerStats', function (error, response, body) {
			if (!error && response.statusCode === 200) {
				console.log(body);
				// TODO: update cache for the player leaders for this current week
			} else {
				console.log(error);
			}
		});

		console.log("running current stat cron");
		request('https://addyai.herokuapp.com/populateCurrentStats', function (error, response, body) {
			if (!error && response.statusCode === 200) {
				console.log(body);
			} else {
				console.log(error);
			}
		});
	},
	false,
	'America/Seattle'
);

// CRONjob to update the value of week when it is 12AM PST / 3AM PST on Monday


module.exports = router;
