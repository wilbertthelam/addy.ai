/* Wilbert Lam
05/16/2016
news.js

Contains components for the news

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

const Article = React.createClass({
	getInitialState: function () {
		return { data: {} };
	},
	componentDidMount: function () {
		this.loadArticle();
	},
	loadArticle: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			method: 'GET',
			cache: false,
			success: function (data) {
				console.log(data.data);
				this.setState({ data: data.data });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this),
		});
	},
	render: function () {
		const s = this.state.data[0];
		return (
			<div>
				<h1>{s.title}</h1>
				<h3>{s.author}</h3>
				<div dangerouslySetInnerHTML={{ __html: s.body }}></div>
			</div>
		);
	}
});

ReactDOM.render(
	<Article url="/news/returnArticleById?articleId=1" />,
	document.getElementById('newsArticleContainer')
);
