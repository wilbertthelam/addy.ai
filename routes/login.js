var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;



/* POST to login into user account */
router.post('/login', function (req, res) {
	checkUserLogin(req.body.email, req.body.password, function(userStatus) {
		if (!userStatus.execSuccess) {
			console.log('DB error.');
			return res.json(userStatus);
		} else {
			if (userStatus.code === 'SUCCESS') {
				var userData = userStatus.data[0];
				req.session.userId = userData.user_id;
				req.session.email = userData.email;
				req.session.firstName = userData.first_name;
				req.session.lastName = userData.last_name;

				return res.json(req.session);
			}
			return res.json(userStatus);
		}
	});
});

/* POST to save articles. */
router.post('/logout', function (req, res) {
	req.session.destroy(function(err) {
		return res.json('logged out');
	});
});

function checkUserLogin(email, password, callback) {
	var statement = 'SELECT * FROM addy_ai_football.users WHERE email = ? AND password = ?';
	connection.query(statement, [email, password], function (err, results) {
		console.log('Login result: ' + JSON.stringify(results));
		if (err) {
			return callback({ execSuccess: false, message: 'DB error in checkUserLogin.', error: err });
		} 
		
		if (results.length < 1) {
			return callback({ execSuccess: true, message: 'Could not find user.', code: 'ERR_NO_USER', data: [] });
		}
		if (results.length > 1) {			
			return callback({ execSuccess: true, message: 'Duplicate users exist.', code: 'ERR_DUPLICATE_USER', data: [] });
		}
		if (results.length === 1) {
			return callback({ execSuccess: true, message: 'User match, can login.', code: 'SUCCESS', data: results });
		}
	});
}

module.exports = router;
