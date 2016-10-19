/* Wilbert Lam
10/13/2016
football_navbar.js

Contains components for the NavBar

*/

import React from 'react';
import $ from 'jquery';
import { Link } from 'react-router';
import { Collapse } from 'react-bootstrap';
import io from 'socket.io-client';

// TODO: BRING THIS TO BE DYNAMIC
const socket = io.connect('http://localhost:8080');

// =========================================
// NAVIGATION BAR ON THE SIDE
// =========================================
const NavBar = React.createClass({
	getInitialState: function () {
		return {
			activeLeagueId: '',
			open: true,
			userId: ''
		};
	},
	componentDidMount: function () {
		this._getUser();
	},
	componentWillReceiveProps: function () {
		this._getUser();
	},
	_logout: function () {
		$.ajax({
			type: 'POST',
			url: '/football/login/logout',
			dataType: 'json',
			cache: false,
			success: function () {
				// console.log(JSON.stringify(data));
				this.context.router.push('/football/login');
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	_getUser: function () {
		$.ajax({
			type: 'POST',
			url: '/football/login/isUserLoggedIn',
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard
				if (data.userId) {
					this.setState({ userId: data.userId });
				} else {
					this.context.router.push('/football/login');
				}
			}.bind(this),
			error: function () {
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div className="nav-bar-container">
				{this.state.userId === 1 ? <ControlPanelButton /> : ''}
				<div className="nav-bar shadow-z-1">
					<ul>
						<li className="nav-bar-title" onClick={() => this.setState({ open: !this.state.open })}>
							<span className="glyphicon glyphicon-th-list" aria-hidden="true"></span> Your leagues
						</li>
						<Collapse
							in={this.state.open}
						>
							<div>
								<LeagueList
									baseUrl="/football/league/userLeagues"
									activeLeagueId={this.state.activeLeagueId}
									userId={this.state.userId}
								/>
							</div>
						</Collapse>
					</ul>
				</div>

				<div className="nav-bar shadow-z-1">
					<ul>
						<Link to="/football/dashboard/leagues">
							<li className="nav-bar-title">
								<span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Join leagues
							</li>
						</Link>
						<Link to="/football/dashboard/">
							<li className="nav-bar-title">
								<span className="glyphicon glyphicon-user" aria-hidden="true"></span> Profile
							</li>
						</Link>
						<li className="nav-bar-title">
							<div onClick={() => this._logout()}>
								<span className="glyphicon glyphicon-log-out" aria-hidden="true"></span> Logout
							</div>
						</li>
					</ul>
				</div>
			</div>
		);
	}
});

// allow for redirects inside the dashboard
NavBar.contextTypes = {
	router: React.PropTypes.object
};

const ControlPanelButton = React.createClass({
	render: function () {
		return (
			<div className="nav-bar shadow-z-1">
				<ul>
					<Link to="/football/dashboard/admin">
						<li className="nav-bar-title">
							<span className="glyphicon glyphicon-wrench" aria-hidden="true"></span> Admin panel
						</li>
					</Link>
				</ul>
			</div>
		);
	}
});

const LeagueList = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			activeLeagueId: this.props.activeLeagueId,
		};
	},
	componentDidMount: function () {
		this.leagueDisplay(this.props.baseUrl);
	},

	componentWillReceiveProps: function (nextProps) {
		this.setState({
			activeLeagueId: nextProps.activeLeagueId
		}, this.leagueDisplay(this.props.baseUrl));
	},
	setActiveLeagueId: function (activeLeagueId, url) {
		console.log('activeLeagueId set at : ' + activeLeagueId);
		this.setState({ activeLeagueId: activeLeagueId });
		this.context.router.push(url);
	},
	leagueDisplay: function (baseUrl) {
		$.ajax({
			type: 'GET',
			url: baseUrl,
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login
				this.setState({ data: data.data });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	render: function () {
		const that = this;
		const leagueNodes = this.state.data.map(function (league) {
			let activeClass = '';
			console.log('that.state.activeID: ' + that.state.activeLeagueId);
			if (that.state.activeLeagueId === league.league_id) {
				activeClass = 'league-selected';
			}
			return (
				<LeagueNode
					leagueId={league.league_id}
					leagueName={league.league_name}
					activeClass={activeClass}
					setActiveLeagueId={that.setActiveLeagueId}
					userId={that.props.userId}
				/>
			);
		});

		if (leagueNodes.length < 1) {
			return (
				<div id="no-league-joined">No leagues joined yet.</div>
			);
		}

		return (
			<div className="nav-bar-subtitle">
				{leagueNodes}
			</div>
		);
	}
});

// allow for redirects inside the dashboard
LeagueList.contextTypes = {
	router: React.PropTypes.object
};


const LeagueNode = React.createClass({
	getInitialState: function () {
		return {
			activeClass: this.props.activeClass,
			notifStatus: 0
		};
	},
	componentDidMount: function () {
		socket.on('voteNotif', this._getNotifStatus);
		socket.emit('voteNotif', { leagueId: this.props.leagueId, userId: this.props.userId });
	},
	componentWillReceiveProps: function (nextProps) {
		socket.on('voteNotif', this._getNotifStatus);
		this.setState({ activeClass: nextProps.activeClass });
	},
	_getNotifStatus: function (data) {
		if (data.leagueId === this.props.leagueId) {
			this.setState({ notifStatus: data.result });
		}
	},
	_indexSelected: function (leagueId, url) {
		console.log('got selected baby!' + leagueId);
		this.props.setActiveLeagueId(leagueId, url);
	},
	render: function () {
		const url = '/football/dashboard/league/' + this.props.leagueId + '/voting';

		return (
			<div className="league-menu-row">
				<li
					className={this.state.activeClass}
					onClick={() => this._indexSelected(this.props.leagueId, url)}
				>
					{this.state.notifStatus === 1 ? <NotificationIcon /> : ''} {this.props.leagueName}
				</li>
			</div>
		);
	}
});

const NotificationIcon = React.createClass({
	render: function () {
		return (
			<span className="glyphicon glyphicon-ok league-filled" aria-hidden="true"></span>
		);
	}
});

module.exports = {
	NavBar: NavBar,
};
