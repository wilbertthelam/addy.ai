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
		return { articleId: '1' };
	},
	openArticle: function (articleId) {
		console.log(articleId);
		this.setState({ articleId: articleId });
	},
	render: function () {
		return (
			<div className="container">
				<div className="col-sm-3">
					<div id="sidebar-wrapper" className="sidebar-toggle">
						<Sidebar url="/news/returnArticlesList" openArticle={this.openArticle} />
					</div>
				</div>
				<div className="col-sm-9">
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
			<div className="newsNavBar shadow-z-1">
				<div className="header articleNav">
					Most recent stories
				</div>
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
		this.loadArticle(this.props.url, this.props.articleId);
	},
	componentWillReceiveProps: function (nextProps) {
		// console.log('URL: ' + nextProps.url);
		// console.log('articleId: ' + nextProps.articleId);
		this.loadArticle(nextProps.url, nextProps.articleId);
	},
	loadArticle: function (url, articleId) {
		$.ajax({
			url: url + articleId,
			dataType: 'json',
			method: 'GET',
			cache: false,
			success: function (data) {
				console.log(data.data);
				this.setState({ data: data.data });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(status, err.toString());
			},
		});
	},
	render: function () {
		const s = this.state.data[0];
		return (
			<div className="articleContainer" >
				<h1>{s.title}</h1>
				<span> {s.update_time} </span>
				<div id="article_author">by {s.author}</div>
				<div id="article_body" dangerouslySetInnerHTML={{ __html: s.body }}></div>
			</div>
		);
	}
});

ReactDOM.render(
	<NewsContainer />,
	document.getElementById('newsArticleContainer')
);
