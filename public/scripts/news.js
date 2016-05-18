/* Wilbert Lam
05/16/2016
news.js

Contains components for the news

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

const NewsContainer = React.createClass({
	getInitialState: function () {
		return { articleId: '8' };
	},
	openArticle: function (articleId) {
		console.log(articleId);
		this.setState({ articleId: articleId });
	},
	render: function () {
		return (
			<div className="pure-g">
				<div className="pure-u-md-1-5">
					<Sidebar url="/news/returnArticlesList" openArticle={this.openArticle} />
				</div>
				<div className="pure-u-md-4-5">
					<Article url="/news/returnArticleById?articleId=" articleId={this.state.articleId} />
				</div>
			</div>
		);
	}
});

const Sidebar = React.createClass({
	getInitialState: function () {
		return { data: [
			{
				article_id: 0,
				title: '',
			}] };
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
				this.setState({ data: data.data });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this),
		});
	},
	render: function () {
		const that = this;
		const ArticleNavNodes = this.state.data.map(function (article) {
			return (
				<ArticleNav
					key={article.article_id}
					title={article.title}
					articleId={article.article_id}
					openArticle={that.props.openArticle}
				/>
			);
		});
		return (
			<div>
				{ArticleNavNodes}
			</div>
		);
	}
});

const ArticleNav = React.createClass({
	propTypes: {
		title: React.PropTypes.string,
		articleId: React.PropTypes.number
	},
	click: function () {
		this.props.openArticle(this.props.articleId);
	},
	render: function () {
		return (
			<div className="articleNav" onClick={this.click}>
				{this.props.title} {this.props.articleId}
			</div>
		);
	}
});

const Article = React.createClass({
	getInitialState: function () {
		return {
			data: [{
				title: '',
				author: '',
				body: ''
			}]
		};
	},
	componentDidMount: function () {
		this.loadArticle();
	},
	componentWillUpdate: function () {
		this.loadArticle();
	},
	loadArticle: function () {
		$.ajax({
			url: this.props.url + this.props.articleId,
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
	<NewsContainer />,
	document.getElementById('newsArticleContainer')
);
