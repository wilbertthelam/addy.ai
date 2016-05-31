/* Wilbert Lam
05/16/2016
news.js

Contains components for the news

*/

import React from 'react';
import $ from 'jquery';

const NewsContainer = React.createClass({
	getInitialState: function () {
		return {
			data: [],
		};
	},
	componentWillMount: function () {
		this.loadArticle();
	},
	loadArticle: function () {
		$.ajax({
			url: '/news/returnArticlesList',
			dataType: 'json',
			method: 'GET',
			cache: false,
			success: function (data) {
				console.log('This is data; ' + JSON.stringify(data.data));
				this.setState({ data: data.data });
				this.setState({ articleId: data.data[0].article_id });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(err.toString());
			}
		});
	},
	openArticle: function (articleId) {
		console.log('open article' + articleId);
		this.setState({ articleId: articleId });
	},
	render: function () {
		return (
			<div className="container">
				<div className="col-sm-3">
					<div id="sidebar-wrapper" className="sidebar-toggle">
						<Sidebar articlesList={this.state.data} openArticle={this.openArticle} />
					</div>
				</div>
				<div className="col-sm-9">
					{this.state.data.length > 0 &&
						<Article
							url="/news/returnArticleById?articleId="
							articleId={this.state.articleId}
						/>
					}
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
			}]
		};
	},
	render: function () {
		const that = this;
		const ArticleNavNodes = this.props.articlesList.map(function (article) {
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
		console.log('this is what id shoudl be= ' + this.props.articleId)
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

module.exports = {
	NewsContainer: NewsContainer
};
