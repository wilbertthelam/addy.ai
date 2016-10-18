/* Wilbert Lam
10/11/2016
football_profile.js

Contains components for the profile page

*/

import React from 'react';
import $ from 'jquery';
import { Button } from 'react-bootstrap';

// =========================================
// ROUTER CONTAINER FOR THE PROFILE SECTION
// =========================================
const AdminContainer = React.createClass({
	componentDidMount: function () {
		this._getUser();
	},
	_getUser: function () {
		$.ajax({
			type: 'POST',
			url: '/football/login/isUserLoggedIn',
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log('logged in as: ' + data.userId);
				// if ID isn't 1 (Wilbert), can't access admin
				if (data.userId !== 1) {
					this.context.router.push('/football/dashboard');
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/dashboard');
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div>
				<div className="col-md-12">
					<div className="s">
						<div className="league-header">
							Admin panel
						</div>
					</div>
				</div>

				<AdminBox url="/football/tasks/currentTime" />
			</div>
		);
	}
});

AdminContainer.contextTypes = {
	router: React.PropTypes.object
};

const AdminBox = React.createClass({
	getInitialState: function () {
		return {
			data: {
				week: '',
				year: '',
			}
		};
	},
	componentDidMount: function () {
		this._getAdminInfo(this.props.url);
	},
	_getAdminInfo: function (url) {
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(JSON.stringify(data));
				this.setState({ data: data.data });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div>
				<div className="col-md-4">
					<div className="shadow-z-1 content-box">
						<AdminInfo
							data={this.state.data}
						/>
					</div>
				</div>

				<div className="col-md-8">
					<div className="shadow-z-1 content-box">
						<LockPanel
							data={this.state.data}
						/>
					</div>
				</div>

				<div className="col-md-4">
					<div className="shadow-z-1 content-box">
						<ClosingPanel
							data={this.state.data}
						/>
					</div>
				</div>

				<div className="col-md-4">
					<div className="shadow-z-1 content-box">
						<WeekPanel
							data={this.state.data}
						/>
					</div>
				</div>

			</div>
		);
	}
});

// Display box with basic time information
const AdminInfo = React.createClass({
	getInitialState: function () {
		return {
			data: this.props.data
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data });
	},
	render: function () {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="league-header small-header">
						Time
					</div>
				</div>
				<div className="col-md-12">
					<p>Current week: <br /> <span className="bold">{this.state.data.week}</span></p>
					<p>Current year: <br /> <span className="bold">{this.state.data.year} </span></p>
				</div>
			</div>
		);
	}
});

// Display box for the lock/unlock functions
const LockPanel = React.createClass({
	getInitialState: function () {
		return {
			resultMessage: '',
			data: this.props.data
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data });
	},
	_getLockCall: function (year, week, lockStatus) {
		$.ajax({
			type: 'POST',
			url: '/football/tasks/changeLockStatus',
			data: { year: year, week: week, locked: lockStatus },
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(JSON.stringify(data));
				if (data.execSuccess) {
					if (lockStatus === 0) {
						this.setState({
							resultMessage: 'Successfully UNLOCKED Week ' + week + ', Year ' + year + '.'
						});
					} else if (lockStatus === 1) {
						this.setState({
							resultMessage: 'Successfully LOCKED Week ' + week + ', Year ' + year + '.'
						});
					}
				} else {
					if (lockStatus === 0) {
						this.setState({
							resultMessage: 'FAILED! Cannot UNLOCK Week ' + week + ', Year ' + year + '.'
						});
					} else if (lockStatus === 1) {
						this.setState({
							resultMessage: 'FAILED! Cannot LOCK Week ' + week + ', Year ' + year + '.'
						});
					}
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.setState({
					resultMessage: 'Network seems to not be working. '
				});
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="league-header small-header">
						Lock/unlock leagues
					</div>
				</div>
				<div className="col-md-6">
					<Button
						bsStyle="danger"
						onClick={() => this._getLockCall(this.state.data.year, this.state.data.week, 1)}
					>
						Lock leagues
					</Button>
				</div>
				<div className="col-md-6">
					<Button
						bsStyle="success"
						onClick={() => this._getLockCall(this.state.data.year, this.state.data.week, 0)}
					>
						Unlock leagues
					</Button>
				</div>
				<div className="col-md-12">
					<br />
					<p className="bold">
						{this.state.resultMessage}
					</p>
				</div>
			</div>
		);
	}
});

// Display box for the closing week and getting league result functions
const ClosingPanel = React.createClass({
	getInitialState: function () {
		return {
			resultMessage: '',
			nonWorkingLeagues: '',
			data: this.props.data
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data });
	},
	_getLockCall: function (year, week) {
		$.ajax({
			type: 'POST',
			url: '/football/tasks/populateLeagueResults',
			data: { year: year, week: week },
			dataType: 'json',
			cache: false,
			success: function (data) {
				if (data.execSuccess === true) {
					this.setState({
						resultMessage: 'Successfully closed week.',
						nonWorkingLeagues: 'Non working leagues are: ' + data.data
					});
				} else {
					this.setState({
						resultMessage: 'Could not close leagues for some reason.'
					});
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.setState({
					resultMessage: 'Network seems to not be working. '
				});
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="league-header small-header">
						Close leagues
					</div>
				</div>

				<div className="col-md-12">
					<Button
						bsStyle="warning"
						onClick={() => this._getLockCall(this.state.data.year, this.state.data.week)}
					>
							Close leagues
					</Button>
				</div>

				<div className="col-md-12">
					<p className="bold">
						<br />
						{this.state.resultMessage}
						<br />
						{this.state.nonWorkingLeagues}
					</p>
				</div>
			</div>
		);
	}
});

// Display box for the updating the week
const WeekPanel = React.createClass({
	getInitialState: function () {
		return {
			resultMessage: '',
			data: this.props.data,
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data });
	},
	_updateWeek: function (week) {
		$.ajax({
			type: 'POST',
			url: '/football/tasks/updateWeek',
			data: { week: week },
			dataType: 'json',
			cache: false,
			success: function (data) {
				if (data.execSuccess === true) {
					this.setState({ resultMessage: 'Successfully updated week.' });
				} else {
					this.setState({ resultMessage: 'Could not update leagues for some reason.' });
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.setState({
					resultMessage: 'Network seems to not be working. '
				});
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="league-header small-header">
						Update week
					</div>
				</div>

				<div className="col-md-12">
					<Button
						bsStyle="warning"
						onClick={() => this._updateWeek(Number(this.state.data.week) + 1)}
					>
						Increment week
					</Button>
					<Button
						bsStyle="info"
						onClick={() => this._updateWeek(Number(this.state.data.week) - 1)}
					>
						Decrement week
					</Button>
				</div>

				<div className="col-md-12">
					<p className="bold">
						<br />
						{this.state.resultMessage}
						<br />
						{this.state.nonWorkingLeagues}
					</p>
				</div>
			</div>
		);
	}
});


module.exports = {
	AdminContainer: AdminContainer
};
