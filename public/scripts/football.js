import * as About from './about.js';
import * as Login from './football_login.js';
import * as Dashboard from './football_dashboard.js';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';

console.log('Football section Entry point');

const MainContainerPage = React.createClass({
	render: function () {
		return (
			<div className="innerMainContainer">
				<div>
					<div className="pure-menu pure-menu-horizontal fixedBannerContainer">
						<div id="menuContainer">
							<ul className="pure-menu-list nav">

								<li className="pure-menu-item">
									<Link to="/dashboard" className="pure-menu-link">Home</Link>
								</li>
								
								<li className="pure-menu-item">
									<Link to="/about" className="pure-menu-link">About</Link>
								</li>

								<li className="pure-menu-item">
									<a href="/" className="pure-menu-link">Baseball</a>
								</li>
							</ul>

							THIS IS THE FOOTBALL STUFF

						</div>
					</div>
				</div>

				{this.props.children}
			</div>
		);
	}
});

const LoginPage = React.createClass({
	render: function () {
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="container">
					<Login.LoginContainer />
				</div>
			</div>
		);
	}
});

const DashboardPage = React.createClass({
	componentWillMount: function () {
		$.ajax({
			type: 'POST',
			url: '/football/login/isUserLoggedIn',
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login
				if (data.userId) {
					console.log('authenticated');
				} else {
					console.log('not logged in, redirect to login');
					this.context.router.push('/login');
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/login');
			}.bind(this)
		});
	},

	render: function () {
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="container">
					<div className="container">
						<div className="col-md-3">
							<Dashboard.NavBar />
						</div>

						<div className="col-md-9">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		);
	}
});

DashboardPage.contextTypes = {
	router: React.PropTypes.object
};

const AboutPage = React.createClass({
	render: function () {
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="container">
					<About.AboutContainer />
				</div>
			</div>
		);
	}
});

//<div className="col-sm-12">
//	<h2>Admin tools</h2>
//	<ul>
//		<li><a href="/populatePastStats">populate past stats</a></li>
//		<li><a href="/populateCurrentStats">populate current stats</a></li>
//		<li><a href="/populateCurrentPlayerStats">populate current player stats</a></li>
//	</ul>
//</div>

ReactDOM.render((
	<Router>
		<Route path="/" component={MainContainerPage}>
			<IndexRoute component={DashboardPage} />
			<Route path="login" component={LoginPage} />
			<Route path="about" component={AboutPage} />
			<Route path="dashboard" component={DashboardPage}>
				<IndexRoute component={Dashboard.DefaultContainer} />
				<Route path="league/:leagueId" component={Dashboard.DashboardContainer}>
					<Route path="voting" component={Dashboard.VotingContainer} />
					<Route path="leaderboard" component={Dashboard.LeaderboardContainer} />
				</Route>
			</Route>
		</Route>
	</Router>
), document.getElementById('mainContainerFootball'));
