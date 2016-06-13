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
		return {
			data: [{
				title: '',
				update_time: '',
				author: '',
				body: ''
			}],
			articleId: ''
		};
	},
	componentWillMount: function () {
		this.loadArticle();
	},
	componentDidUpdate: function () {
		// ReactDOM.findDOMNode(this).scrollIntoView();
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
		if (this.state.data.length > 0 && this.state.articleId !== '') {
			return (
				<div className="container">
					<div className="col-sm-4 sidebar">
						<div id="sidebar-wrapper" className="sidebar-toggle">
							<Sidebar
								currentArticleId={this.state.articleId}
								articlesList={this.state.data}
								openArticle={this.openArticle}
							/>
						</div>
					</div>
					<div className="col-sm-8">
						<Article
							url="/news/returnArticleById?articleId="
							articleId={this.state.articleId}
						/>
					</div>
				</div>
			);
		}

		return (<div className="container" />);
	}
});

const Sidebar = React.createClass({
	getInitialState: function () {
		return { data: [
			{
				article_id: this.props.currentArticleId,
				title: '',
			}]
		};
	},
	render: function () {
		const that = this;
		let clickState = 'articleNav';
		const ArticleNavNodes = this.props.articlesList.map(function (article) {
			if (that.props.currentArticleId === article.article_id) {
				clickState = 'articleNav navSelected';
			} else {
				clickState = 'articleNav';
			}
			console.log('current click state= ' + clickState);
			return (
				<ArticleNav
					key={article.article_id}
					title={article.title}
					articleId={article.article_id}
					date={article.update_time}
					openArticle={that.props.openArticle}
					clickState={clickState}
				/>
			);
		});
		return (
			<div className="newsNavBar shadow-z-1">
				<div className="articleNavHeader">
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
		const date = new Date(this.props.date);
		const formattedDate = date.toDateString();
		return (
			<div className={this.props.clickState} onClick={this.click}>
				<div id="newsDateLabel">
					<span className="label label-primary">{formattedDate}</span>
				</div>
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
		console.log('this is what id shoudl be= ' + this.props.articleId);
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
		const date = new Date(s.update_time);
		const formattedDate = date.toDateString();
		return (
			<div className="articleContainer" >
				<h1>{s.title}</h1>
				<div className="articleSubHeader">
					<span id="article_author">by {s.author}</span> on
					<span> {formattedDate} </span>
				</div>
				<div id="article_body" dangerouslySetInnerHTML={{ __html: s.body }}></div>
			</div>
		);
	}
});

module.exports = {
	NewsContainer: NewsContainer
};
