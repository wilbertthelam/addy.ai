var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn.js');
var connection = db;

/* GET to return ALL articles. */
router.get('/returnArticles', function (req, res) {
	var statement = 'SELECT * FROM articles ORDER BY update_time DESC;';
	connection.query(statement, function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get articles.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Articles successfully retrieved.', data: results });
		}
	});
});

/* GET to return single article by id. */
router.get('/returnArticleById', function (req, res) {
	var statement = 'SELECT * FROM articles WHERE article_id = ? ORDER BY update_time DESC;';
	connection.query(statement, [req.query.articleId], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot get articles.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Articles successfully retrieved.', data: results });
		}
	});
});

/* POST to save articles. */
router.post('/saveArticle', function (req, res) {
	var article = req.body;
	var statement = 'INSERT INTO articles SET ?';
	connection.query(statement, article, function(err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot save articles.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Article saved.', data: results });
		}
	});
});

module.exports = router;
