import * as About from './about.js';
import * as Login from './football_login.js';
import * as Dashboard from './football_dashboard.js';
import * as Leagues from './football_leagues.js';
import * as NavBar from './football_navbar.js';
import * as Profile from './football_profile.js';
import * as Admin from './football_admin.js';
import * as Voting from './football_dashboard_voting.js';
import * as Leaderboard from './football_dashboard_leaderboard.js';

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
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
									<Link to="/football/dashboard" className="pure-menu-link">Home</Link>
								</li>
								
								<li className="pure-menu-item">
									<Link to="/about" className="pure-menu-link">About</Link>
								</li>

								<li className="pure-menu-item">
									<a href="/" className="pure-menu-link">Baseball</a>
								</li>
							</ul>
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

const MainPage = React.createClass({
	componentDidMount: function () {
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
					this.context.router.push('/football/login');
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},

	render: function () {
		// alert(JSON.stringify(this.props.params.leagueId));
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="container">
					<div className="container">
						<div className="col-md-3">
							<NavBar.NavBar />
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

MainPage.contextTypes = {
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

const NotFound = React.createClass({
	render: function () {
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="container">
					<h1>404! 404! 404!</h1>
					<h3>Uh oh, page not found! This isn't Russell Wilson's playbook after all.</h3>
				</div>
			</div>
		);
	}
});

ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/football" component={MainContainerPage}>
			<IndexRoute component={MainPage} />
			<Route path="login" component={LoginPage} />
			<Route path="about" component={AboutPage} />
			<Route path="dashboard" component={MainPage}>
				<IndexRoute component={Profile.ProfileContainer} />
				<Route path="league/:leagueId" component={Dashboard.DashboardContainer}>
					<Route path="voting" component={Voting.VotingContainer} />
					<Route path="leaderboard" component={Leaderboard.LeaderboardContainer} />
				</Route>
				<Route path="leagues" component={Leagues.LeagueContainer} />
				<Route path="admin" component={Admin.AdminContainer} />
			</Route>
			<Route path="/*" component={NotFound} />
		</Route>
	</Router>
), document.getElementById('mainContainerFootball'));
