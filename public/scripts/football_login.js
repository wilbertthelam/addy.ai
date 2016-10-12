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
				<div className="splash-image">
					<div className="col-md-6">
						<Splash />
					</div>

					<div className="col-md-6">
						<LoginBox />
					</div>
				</div>

				<div className="col-md-4">
					<h2><span className="glyphicon glyphicon-menu-right" aria-hidden="true"></span> What's this junk?</h2>
					<p>
						Do you have that friend who always thinks his team is gonna win? 
						Or that other team manager who thinks he's hot stuff?
						addy.ai Football let's you vote on yours or someone elses weekly matchups to prove who really knows their league best.
						Just search up your league and vote!
					</p>
				</div>

				<div className="col-md-4">
					<h2><span className="glyphicon glyphicon-menu-right" aria-hidden="true"></span> FAQ</h2>
					<p className="bold"><span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span> Why is my league not listed?</p>
					<p>
						Some leagues aren't listed yet in our database, so you can add your league by simply pasting any URL from your ESPN league page (any page works). 
						Just make sure you're in the league page and not on the general ESPN site or it'll be difficult for us to get the league information. 
					</p>
					<p className="bold"><span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span> Why won't my league load after I've added it?</p>
					<p>
						The only leagues compatible right now are head-to-head matchups from ESPN fantasy football. 
						Secondly, check with your league manager to see if your league is current set to private. 
						Unforunately, addy.ai Football only works with public leagues (ask your LM to change it under LM settings).
					</p>

				</div>

				<div className="col-md-4">
					<h2><span className="glyphicon glyphicon-menu-right" aria-hidden="true"></span> Need more help?</h2>
					<p>Email wilbertthelam@gmail.com for more help, or krestofur@gmail.com for career opportunities.</p>
				</div>
			</div>

		);
	}
});

const Splash = React.createClass({
	render: function () {
		return (
			<div className="splash-description">
				<div>
					<span id="splash-company">addy.ai </span><span id="splash-football">FOOTBALL</span>
				</div>
				<div>
					<span id="splash-subtitle">ESPN Fantasy League Pick'em</span>
				</div>
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


module.exports = {
	LoginContainer: LoginContainer
};
