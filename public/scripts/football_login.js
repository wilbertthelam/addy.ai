/* Wilbert Lam
09/27/2016
football_login.js

Contains components for the login

*/

import React from 'react';
import $ from 'jquery';
import { Button, Nav, NavItem } from 'react-bootstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const LoginContainer = React.createClass({
	render: function () {
		return (
			<div>
				<div className="splash-image">
					<div className="splash-inner">
						<div className="col-md-6">
							<ReactCSSTransitionGroup
								transitionName="example"
								transitionAppear={true}
								transitionAppearTimeout={500}
							>
								<Splash />
							</ReactCSSTransitionGroup>
						</div>

						<div className="col-md-6">
							<ReactCSSTransitionGroup
								transitionName="example"
								transitionAppear={true}
								transitionAppearTimeout={500}
							>
								<LoginBox />
							</ReactCSSTransitionGroup>
						</div>
					</div>
				</div>
				<div id="addy-image">
					<img src="http://i.imgur.com/DaPiYWu.png" alt="addy_iamge" />
					<span>
						I endorse this product
					</span>
				</div>
				<div className="container">
					<div className="col-sm-12">
						<h1>What's this junk?</h1>
					</div>

					<div className="col-md-12">
						<ReactCSSTransitionGroup
							transitionName="example"
							transitionAppear={true}
							transitionAppearTimeout={500}
						>
							<div className="col-md-4">
								<StepsBox
									glyphName="glyphicon glyphicon-fire"
									header="Find that league you're trashing"
									imgUrl={require('../media/leagues_preview.png')}
									imgAlt="leagues_preview"
								/>
							</div>
							<div className="col-md-4">
								<StepsBox
									glyphName="glyphicon glyphicon-trash"
									header="Mock how your friends voted"
									imgUrl={require('../media/voting_preview.png')}
									imgAlt="voting_preview"
								/>
							</div>

							<div className="col-md-4">
								<StepsBox
									glyphName="glyphicon glyphicon-sunglasses"
									header="Gloat at the plebes"
									imgUrl={require('../media/leaderboard_preview.png')}
									imgAlt="leaderboard_preview"
								/>
							</div>

						</ReactCSSTransitionGroup>
					</div>

					<div className="col-sm-12">
						<h1>Stil don't get it?</h1>
					</div>

					<ReactCSSTransitionGroup
						transitionName="example"
						transitionAppear={true}
						transitionAppearTimeout={500}
					>
						<div className="col-sm-12">
							<div className="col-md-4">
								<h2>
									<span className="glyphicon glyphicon-tags" aria-hidden="true"></span>
									&nbsp;
									More details please
								</h2>
								<p id="login-details-text">
									Do you have that friend who always thinks his team is gonna win?
									Or that other team manager who thinks he's hot stuff?
									addy.ai Football let's you vote on yours or someone elses weekly matchups
									to prove who really knows their league best.
									Just search up your league and vote!
								</p>
							</div>

							<div className="col-md-4">
								<h2>
									<span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
									&nbsp;
									FAQ
								</h2>
								<p className="bold">
									<span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span>
									&nbsp;
									Why is my league not listed?
								</p>
								<p>
									Some leagues aren't listed yet in our database,
									so you can add your league by simply pasting any URL
									from your ESPN league page (any page works).
									Just make sure you're in the league page and
									not on the general ESPN site or it'll be difficult
									for us to get the league information.
								</p>
								<p className="bold">
									<span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span>
									&nbsp;
									Why won't my league load after I've added it?
								</p>
								<p>
									The only leagues compatible right now are head-to-head
									matchups from ESPN fantasy football.
									Secondly, check with your league manager to see if your
									league is current set to private.
									Unforunately, addy.ai Football only works with public leagues
									(ask your LM to change it under LM settings).
								</p>
								<p className="bold">
									<span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span>
									&nbsp;
									Why won't it let me vote?
								</p>
								<p>
									All voting closes Saturday evening and reopens Tuesday morning, mainly
									to keep people from seeing too much of the current scores of teams in progress.
									Just for leeway, we're letting voting extend past the Thursday night games.
									If you see the lock icon, then voting is closed for the current week.
								</p>
							</div>

							<div className="col-md-4">
								<h2>
									<span className="glyphicon glyphicon-envelope" aria-hidden="true"></span>
									&nbsp;
									Need more help?
								</h2>
								<p>
									Email
									&nbsp;
									<a href="mailto:wilbertthelam@gmail.com?Subject=addy.ai%20help" target="_top">
										wilbertthelam@gmail.com
									</a>
									&nbsp;
									for more help, or
									&nbsp;
									<a href="mailto:krestofur@gmail.com?Subject=Give%20me%20money" target="_top">
										krestofur@gmail.com
									</a>
									&nbsp;
									for career opportunities.
								</p>
								<h2>
									<span className="glyphicon glyphicon-paperclip" aria-hidden="true"></span>
									&nbsp;
									Technical stuff
								</h2>
								<p>
									Full app created by Wilbert Lam using random stuff
									learned at University of Washington,
									Google, StackOverflow and brain.
								</p>
								<p>
									<ul>
										<li>
											<span className="bold">Back-end:</span> Node.js (Express)
										</li>
										<li>
											<span className="bold">Front-end:</span> ReactJS
										</li>
										<li>
											<span className="bold">Database:</span> MySQL
										</li>
										<li>
											<span className="bold">Hosting:</span> Heroku/AWS RDS
										</li>
										<li>
											<span className="bold">Other tools:</span> Python, Webpack
										</li>
									</ul>
								</p>
								<p>
									Find me:
									<div className="footer-icons">
										<a href="https://www.linkedin.com/in/wilbert-lam-47498565"><i className="fa fa-linkedin"></i></a>
										<a href="https://github.com/wilbertthelam/addy.ai"><i className="fa fa-github"></i></a>
									</div>
								</p>
								<p>
									Credit to the Men Bowl ESPN fantasy football league. May there never be a repeat champion again.
								</p>
							</div>
						</div>
					</ReactCSSTransitionGroup>
				</div>
			</div>
		);
	}
});

const StepsBox = React.createClass({
	render: function () {
		return (
			<div>
				<h2>
					<span className={this.props.glyphName} aria-hidden="true"></span>
					&nbsp;
					&nbsp;
					{this.props.header}
				</h2>
				<img
					className="steps-box-img"
					src={this.props.imgUrl}
					alt={this.props.imgAlt}
				/>
			</div>
		);
	}
});

const Splash = React.createClass({
	render: function () {
		return (
			<div className="splash-description">
				<div>
					<span id="splash-subtitle">ESPN Fantasy Football League Pick'em</span>
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
			email: '',
			password: '',
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
					this.context.router.push('/football/dashboard');
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
		let warningLabel;
		if (this.state.warnings.notExist) {
			warningLabel = <WarningLabel warning="Incorrect email or password!" />;
		} else if (this.state.warnings.networkDown) {
			warningLabel = <WarningLabel warning="Uh oh, the network's down, check again in a bit!" />;
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
				{this.props.warning}
			</div>
		);
	}
});

const SignupForm = React.createClass({
	getInitialState: function () {
		return {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			errorMessage: ''
		};
	},
	updateFirstName: function (e) {
		this.setState({ errorMessage: '', firstName: e.target.value });
	},
	updateLastName: function (e) {
		this.setState({ errorMessage: '', lastName: e.target.value });
	},
	updateEmail: function (e) {
		this.setState({ errorMessage: '', email: e.target.value });
	},
	updatePassword: function (e) {
		this.setState({ errorMessage: '', password: e.target.value });
	},
	signup: function () {
		// if all filled in correctly, then check the final checks
		if (this.state.firstName !== '' && this.state.lastName !== ''
				&& this.state.password !== '' && this.state.email !== '') {
			let message = '';
			const lowerEmail = this.state.email.toLowerCase();
			const lowerFirstName = this.state.firstName.toLowerCase();

			if (!this._checkEmailValidity(this.state.email)) {
				message = 'We need a valid email!';
				this.setState({ errorMessage: message });
			} else if (lowerFirstName === 'wilbert' || lowerFirstName === 'wilburt'
					|| lowerFirstName === 'burt' || lowerFirstName === 'bert'
					|| lowerFirstName === 'wilbs' || lowerFirstName === 'wilb') {
				message = 'Yeah, you can\'t use my name stupid.';
				this.setState({ errorMessage: message });
			} else if (lowerEmail === 'wilbertthelam@gmail.com' || lowerEmail === 'wlam93@uw.edu') {
				message = 'Don\'t use my email stupid chris.';
				this.setState({ errorMessage: message });
			} else {
				this.setState({
					errorMessage: '',
				});

				$.ajax({
					type: 'POST',
					url: '/football/login/signup',
					data: { email: this.state.email,
						password: this.state.password,
						firstName: this.state.firstName.toLowerCase(),
						lastName: this.state.lastName.toLowerCase()
					},
					dataType: 'json',
					cache: false,
					success: function (data) {
						console.log(JSON.stringify(data));
						// if successfully logged in, open dashboard
						if (data.userId) {
							console.log('logged in');
							this.context.router.push('/football/dashboard');
						} else {
							this.setState({ errorMessage: 'This email is already taken!' });
							console.log('login failed');
						}
					}.bind(this),
					error: function (status, err) {
						console.error(status, err.toString());
						this.setState({
							errorMessage: 'Uh oh, looks like the network is down, try again later!'
						});
					}.bind(this)
				});
			}
		} else {
			this.checkMessages();
		}
	},
	_checkEmailValidity: function (email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	checkMessages: function () {
		let message = 'We need your ';

		if (this.state.firstName === '') {
			message += 'first name!';
			this.setState({ errorMessage: message });
		} else if (this.state.lastName === '') {
			message += 'last name!';
			this.setState({ errorMessage: message });
		} else if (this.state.email === '') {
			message += 'email!';
			this.setState({ errorMessage: message });
		} else if (this.state.password === '') {
			message += 'password!';
			this.setState({ errorMessage: message });
		} else {
			message = '';
			this.setState({ errorMessage: message });
		}
	},
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
							value={this.state.firstName}
							onChange={this.updateFirstName}
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
							value={this.state.lastName}
							onChange={this.updateLastName}
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
						onClick={this.signup}
					>
						Signup
					</Button>
				</div>

				<div className="col-sm-10">
					{this.state.message !== '' ? <WarningLabel warning={this.state.errorMessage} /> : ''}
				</div>
			</div>
		);
	}
});

SignupForm.contextTypes = {
	router: React.PropTypes.object
};


module.exports = {
	LoginContainer: LoginContainer
};
