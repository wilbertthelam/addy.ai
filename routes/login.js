var express = require('express');
var router = express.Router();

var async = require('async');

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

var loginAuth = require('./utilities/loginAuthenticationMiddleware.js');

var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var cryptoPassword = 'football';

function _encryptPassword(password) {
	var cipher = crypto.createCipher(algorithm, cryptoPassword);
	var crypted = cipher.update(password, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;
}

// helper to check if user is logged in
function _checkUserLogin(email, passwordPlain, callback) {
	// console.log(passwordPlain);
	var statement = 'SELECT * FROM addy_ai_football.users WHERE email = ? AND password = ?;';

	var password = _encryptPassword(passwordPlain);

	// console.log(password.toString());
	connection.query(statement, [email, password], function (err, results) {
		// // console.log('Login result: ' + JSON.stringify(results));
		if (err) {
			return callback({
				execSuccess: false,
				message: 'DB error in checkUserLogin.',
				error: err
			});
		}
		if (results.length < 1) {
			return callback({
				execSuccess: true,
				message: 'Could not find user.',
				code: 'ERR_NO_USER',
				data: []
			});
		}
		if (results.length > 1) {
			return callback({
				execSuccess: true,
				message: 'Duplicate users exist.',
				code: 'ERR_DUPLICATE_USER',
				data: []
			});
		}
		if (results.length === 1) {
			return callback({
				execSuccess: true,
				message: 'User match, can login.',
				code: 'SUCCESS',
				data: results
			});
		}

		return callback({
			execSuccess: true,
			message: 'Some wierd issue with checking user login',
			code: 'ERR_UNKNOWN',
			data: results
		});
	});
}

/* POST to login into user account */
router.post('/login', function (req, res) {
	_checkUserLogin(req.body.email, req.body.password, function (userStatus) {
		if (!userStatus.execSuccess) {
			// console.log('DB error while logging in.');
			return res.json(userStatus);
		}
		if (userStatus.code === 'SUCCESS') {
			var userData = userStatus.data[0];
			req.session.userId = userData.user_id;
			req.session.email = userData.email;
			req.session.firstName = userData.first_name;
			req.session.lastName = userData.last_name;

			return res.json(req.session);
		}
		return res.json(userStatus);
	});
});

/* POST to check if user is logged in or not FOR THE CLIENT */
router.post('/isUserLoggedIn', function (req, res) {
	var status = false;
	if (req.session.userId) {
		status = true;
	}
	// console.log(req.session.userId);
	return res.json({
		authenticated: status,
		userId: req.session.userId
	});
});

/* POST to save articles. */
router.post('/logout', function (req, res) {
	req.session.destroy(function () {
		return res.json('logged out');
	});
});

router.get('/testLogin', loginAuth.isAuthenticated, function (req, res) {
	return res.json('Logged in.');
});


/* POST user creation */
router.post('/signup', function (req, res) {
	// take email, password, firstName, lastName
	// check to see if user exists already
	// if not, then create new user

	var email = req.body.email.toLowerCase();
	var passwordPlain = req.body.password;
	var firstName = req.body.firstName.toLowerCase();
	var lastName = req.body.lastName.toLowerCase();

	if (email === '' || passwordPlain === '' || firstName === '' || lastName === '') {
		return res.json({
			execSuccess: false,
			message: 'One of the fields is empty.'
		});
	}

	var userId;

	var password = _encryptPassword(passwordPlain);

	// check to see if email is free

	async.series({
		checkUserAvailable: function (cb0) {
			var statement = 'SELECT * FROM addy_ai_football.users WHERE email = ?;';
			connection.query(statement, [email, password], function (err, results) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'DB error in checkUserLogin.',
						error: err
					});
				}

				if (results.length !== 0) {
					// console.log('User email taken already');
					return res.json({
						execSuccess: true,
						message: 'User (email) already exists.',
						code: 'ERR_DUPLICATE_USER',
						data: []
					});
				}
				// console.log('User email available');
				return cb0(null, 'Email available');
			});
		},

		createAccount: function (cb1) {
			connection.beginTransaction(function (err) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'Cannot begin transaction to create account.',
						error: err
					});
				}
			});

			var statement = 'INSERT INTO addy_ai_football.users SET ?;';
				var params = {
					email: email,
					password: password,
					last_name: lastName,
					first_name: firstName
				};
				connection.query(statement, params, function (err, result) {
					if (err) {
						connection.rollback();
						return res.json({
							execSuccess: false,
							message: 'DB error in createAccount.',
							error: err
						});
					}
					connection.commit();
					// console.log('id returned: ' + result.insertId);
					userId = result.insertId;
					return cb1(null, 'Account created');
				});
		},

		startNewSession: function () {
			req.session.userId = userId;
			req.session.email = email;
			req.session.firstName = firstName;
			req.session.lastName = lastName;

			return res.json(req.session);
		},

	}, function (err) {
		// if error, return issue
		if (err) {
			return res.json({
				execSuccess: false,
				message: 'Unknown issue in user signup',
				error: err
			});
		}
		return res.json({
			execSuccess: false,
			message: 'Unknown issue in user signup',
			error: err
		});
	});
});

/* POST to change password
	Get userId
	Check if userId old password matches
	If so, then add in new password
	Else return bad password error
*/
router.post('/password-change', loginAuth.isAuthenticated, function (req, res) {
	var oldPassword = _encryptPassword(req.body.oldPassword);
	var newPassword = req.body.newPassword;

	if (newPassword === '' || newPassword === null) {
		return res.json({
			execSuccess: false,
			message: 'New password empty.',
			code: 'ERR_EMPTY'
		});
	}

	async.series({
		checkOldPasswordMatch: function (cb) {
			var statement = 'SELECT * FROM addy_ai_football.users WHERE user_id = ? AND password = ?;';
			connection.query(statement, [req.session.userId, oldPassword], function (err, results) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'Could not get rows.',
						error: err,
						code: 'ERR_NETWORK'
					});
				}

				if (results.length !== 1) {
					// console.log('User email taken already');
					return res.json({
						execSuccess: false,
						message: 'Incorrect password.',
						code: 'ERR_PASS_NOT_MATCH',
						data: []
					});
				}
				// console.log('User email available');
				return cb(null, 'Old password doesn\'t matche.');
			});
		},
		updatePassword: function () {
			var statement = 'UPDATE addy_ai_football.users SET password = ? WHERE user_id = ?;';
			var params = [
				_encryptPassword(newPassword),
				req.session.userId
			];

			connection.query(statement, params, function (err) {
				if (err) {
					return res.json({
						execSuccess: false,
						message: 'Could not update password',
						error: err,
						code: 'ERR_PASS_UPDATE_FAIL'
					});
				}
				return res.json({
					execSuccess: true,
					message: 'Password successfully updated.',
					data: []
				});
			});
		}
	});
});


module.exports = router;
