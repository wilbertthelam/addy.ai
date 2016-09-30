/* Wilbert Lam
09/27/2016
football_login.js

Contains components for the news

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Router, Route, Link, browserHistory } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';

const LoginContainer = React.createClass({
	render: function () {
		return (
			<div className="container">
				<div className="col-md-6">
					<Splash />
				</div>

				<div className="col-md-6">
					<LoginBox />
				</div>
			</div>

		);
	}
});

const Splash = React.createClass({
	render: function () {
		return (
			<div>
				<h3>addy.ai</h3>
				<h1>FOOTBALL</h1>
				<h2>Weekly ESPN Fantasy League Pick'em</h2>
			</div>
		);
	}
});

const LoginBox = React.createClass({
	getInitialState: function () {
		return {
			activeTab: 1,
		};
	},
	handleSelect: function (keyId) {
		this.setState({ activeTab: keyId });
	},
	render: function () {
		let displayForm;
		if (this.state.activeTab === 1) {
			displayForm = <LoginForm />;
		} else {
			displayForm = <SignupForm />;
		}
		return (
			<div className="login-box shadow-z-1">
				<Nav bsStyle="tabs" justified activeKey={this.state.activeTab} onSelect={this.handleSelect}>
					<NavItem eventKey={1}>Login</NavItem>
					<NavItem eventKey={2}>Signup</NavItem>
				</Nav>
				<div className="input-group login-box-inner">
					{displayForm}
				</div>
			</div>
		);
	}
});

const LoginForm = React.createClass({
	getInitialState: function () {
		return {
			email: 'wilbertthelam@gmail.com',
			password: 'wilbert',
			warnings: {
				notExist: false,
				networkDown: false,
			}
		};
	},
	updateEmail: function (e) {
		this.setState({ email: e.target.value });
	},
	updatePassword: function (e) {
		this.setState({ password: e.target.value });
	},
	login: function () {
		// ajax login on backend, if successful then go to new new page
		$.ajax({
			type: 'POST',
			url: '/football/login/login',
			data: { email: this.state.email, password: this.state.password },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard
				if (data.userId) {
					this.setState({ warnings: { notExist: false } });
					console.log('logged in');
					this.context.router.push('/dashboard');
				} else {
					this.setState({ warnings: { notExist: true } });
					console.log('login failed');
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.setState({ warnings: { networkDown: true } });
			}.bind(this)
		});
	},
	render: function () {
		var warningLabel;
		if (this.state.warnings.notExist) {
			warningLabel = <WarningLabel />;
		}
		return (
			<form>
				<div className="col-md-12">
					<p>
						<input
							type="text"
							name="email"
							placeholder="Email"
							className="form-control"
							value={this.state.email}
							onChange={this.updateEmail}
						/>
					</p>
				</div>

				<div className="col-md-12">
					<p>
						<input
							type="password"
							name="password"
							placeholder="Password"
							className="form-control"
							value={this.state.password}
							onChange={this.updatePassword}
						/>
					</p>
				</div>

				<div className="col-sm-2">
					<Button
						bsStyle="primary"
						onClick={this.login}
					>
						Login
					</Button>
				</div>

				<div className="col-sm-10">
					{warningLabel}
				</div>

			</form>
		);
	}
});

LoginForm.contextTypes = {
	router: React.PropTypes.object
};

const WarningLabel = React.createClass({
	render: function () {
		return (
			<div className="warning">
				Incorrect email or password!
			</div>
		);
	}
});

const SignupForm = React.createClass({
	render: function () {
		return (
			<div>
				<div className="col-md-6">
					<p>
						<input
							type="text"
							name="firstName"
							placeholder="First name"
							className="form-control"
						/>
					</p>
				</div>

				<div className="col-md-6">
					<p>
						<input
							type="text"
							name="lastName"
							placeholder="Last name"
							className="form-control"
						/>
					</p>
				</div>

				<div className="col-md-12">
					<p>
						<input
							type="text"
							name="email"
							placeholder="Email"
							className="form-control"
						/>
					</p>
				</div>

				<div className="col-md-12">
					<p>
						<input
							type="password"
							name="password"
							placeholder="Password"
							className="form-control"
						/>
					</p>
				</div>

				<Link to="/about">Signup</Link>
			</div>
		);
	}
});

// const LoginContainer = React.createClass({
// 	getInitialState: function () {
// 		return {
// 			data: [{
// 				title: '',
// 				update_time: '',
// 				author: '',
// 				body: ''
// 			}],
// 			articleId: ''
// 		};
// 	},
// 	componentWillMount: function () {
// 		this.loadArticle();
// 	},
// 	componentDidUpdate: function () {
// 		// ReactDOM.findDOMNode(this).scrollIntoView();
// 	},
// 	loadArticle: function () {
// 		$.ajax({
// 			url: '/news/returnArticlesList',
// 			dataType: 'json',
// 			method: 'GET',
// 			cache: false,
// 			success: function (data) {
// 				console.log('This is data; ' + JSON.stringify(data.data));
// 				this.setState({ data: data.data });
// 				this.setState({ articleId: data.data[0].article_id });
// 			}.bind(this),
// 			error: function (xhr, status, err) {
// 				console.error(err.toString());
// 			}
// 		});
// 	},
// 	openArticle: function (articleId) {
// 		console.log('open article' + articleId);
// 		this.setState({ articleId: articleId });
// 	},
// 	render: function () {
// 		if (this.state.data.length > 0 && this.state.articleId !== '') {
// 			return (
// 				<div className="container">
// 					<div className="col-sm-4 sidebar">
// 						<div id="sidebar-wrapper" className="sidebar-toggle">
// 							<Sidebar
// 								currentArticleId={this.state.articleId}
// 								articlesList={this.state.data}
// 								openArticle={this.openArticle}
// 							/>
// 						</div>
// 					</div>
// 					<div className="col-sm-8">
// 						<Article
// 							url="/news/returnArticleById?articleId="
// 							articleId={this.state.articleId}
// 						/>
// 					</div>
// 				</div>
// 			);
// 		}

// 		return (<div className="container" />);
// 	}
// });


module.exports = {
	LoginContainer: LoginContainer
};
