var express = require('express');
var router = express.Router();

// pass connection for db
var db = require('../db_conn_football.js');
var connection = db;

/* GET to return ALL articles. */
router.get('/userLeagues', function (req, res) {
	var statement = 'SELECT articles.article_id, articles.title, articles.update_time FROM articles WHERE publish_status = 1 ORDER BY update_time DESC;';
	connection.query(statement, function (err, results) {
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

/* POST to save articles. */
router.post('/saveArticle', function (req, res) {
	var article = req.body;
	var statement = 'UPDATE articles SET ? WHERE article_id = ?;';
	connection.query(statement, [article, article.article_id], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot save articles.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Article saved.', data: results });
		}
	});
});

/* POST to publish article, updates publish_status */
router.post('/publishArticle', function (req, res) {
	var statement = 'UPDATE articles SET publish_status = 1 WHERE article_id = ?;';
	connection.query(statement, [req.body.article_id], function (err, results) {
		if (err) {
			return res.json({ execSuccess: false, message: 'Cannot publsh article.', error: err });
		} else {
			return res.json({ execSuccess: true, message: 'Article published.', data: results });
		}
	});
});

module.exports = router;
