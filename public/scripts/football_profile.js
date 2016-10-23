/* Wilbert Lam
10/11/2016
football_profile.js

Contains components for the profile page

*/
import * as Input from './components/input.js';
import React from 'react';
import $ from 'jquery';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Modal, Button } from 'react-bootstrap';
const moment = require('moment');

// =========================================
// ROUTER CONTAINER FOR THE PROFILE SECTION
// =========================================
const ProfileContainer = React.createClass({

	render: function () {
		return (
			<div>
				<ReactCSSTransitionGroup
					transitionName="example"
					transitionAppear={true}
					transitionAppearTimeout={500}
				>
					<div className="col-md-12">
						<div className="">
							<div className="league-header">
								<span>Profile </span>
								<EditProfileButton />
							</div>
						</div>
					</div>

					<ProfileBox />
				</ReactCSSTransitionGroup>
			</div>
		);
	}
});

const ProfileBox = React.createClass({
	render: function () {
		return (
			<div>
				<div className="col-md-12">
					<div className="shadow-z-1 content-box">
						<UserInfo
							url="/football/league/user"
						/>
					</div>
				</div>

				<div className="col-md-12">
					<div className="shadow-z-1 content-box profile-league-standings">
						<div className="">
							<table className="table table-hover table-mc-amber">
								<thead>
									<tr>
										<th>Your leagues</th>
										<th>Your wins</th>
										<th>Your losses</th>
										<th>Your win %</th>
									</tr>
								</thead>
								<OverallRecords
									url="/football/voting/leaderboardForUser"
									year="2016"
								/>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

// Display box with basic user profile information
const UserInfo = React.createClass({
	getInitialState: function () {
		return {
			data: {
				first_name: '',
				last_name: '',
				email: '',
				userId: '',
			},
			createTime: ''
		};
	},
	componentDidMount: function () {
		this._getUserInfo(this.props.url);
	},
	_getUserInfo: function (url) {
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(JSON.stringify(data));
				this.setState({
					data: data.data[0],
					createTime: this._formatDate(data.data[0].create_time)
				});
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	_capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	_formatDate: function (date) {
		const t = date.split(/[- : T]/);
		const d = new Date(t[0], t[1] - 1, t[2]);
		return moment(d).format('MMMM Do YYYY');
	},
	render: function () {
		return (
			<div className="profile-info">
				<div>
					Name: <br />
					<span className="bold">
						{this._capitalize(this.state.data.first_name)}
						&nbsp;{this._capitalize(this.state.data.last_name)}
					</span>
				</div>
				<div>
					Email: <br />
					<span className="bold">
						{this.state.data.email}
					</span>
				</div>
				<div>
					Joined: <br />
					<span className="bold">
						{this.state.createTime}
					</span>
				</div>
			</div>
		);
	}
});

const EditProfileButton = React.createClass({
	getInitialState: function () {
		return {
			showModal: false
		};
	},
	_open: function () {
		this.setState({
			showModal: true
		});
	},
	_close: function () {
		this.setState({
			showModal: false
		});
	},
	render: function () {
		return (
			<span>
				<span className="edit-profile-button red" onClick={() => this._open()}>
					<span className="glyphicon glyphicon-cog" aria-hidden="true"></span> Edit profile
				</span>

				<PasswordChangeModal
					showModal={this.state.showModal}
					closeModal={this._close}
				/>
			</span>
		);
	}
});

const PasswordChangeModal = React.createClass({
	getInitialState: function () {
		return {
			showModal: this.props.showModal
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({
			showModal: nextProps.showModal
		});
	},
	render: function () {
		return (
			<Modal
				show={this.state.showModal}
				onHide={this.props.closeModal}
			>
				<Modal.Body>
					<PasswordChangeBox />
				</Modal.Body>
			</Modal>
		);
	}
});

const PasswordChangeBox = React.createClass({
	getInitialState: function () {
		return {
			values: {
				passwordOld: '',
				passwordNew: ''
			},
			message: ''
		};
	},
	_fieldValues: function (name, value) {
		const stateObj = this.state.values;
		stateObj[name] = value;
		this.setState({
			values: stateObj
		});
	},
	_changePassword: function (oldPassword, newPassword) {
		$.ajax({
			type: 'POST',
			url: '/football/login/password-change',
			dataType: 'json',
			data: {
				oldPassword: oldPassword,
				newPassword: newPassword
			},
			cache: false,
			success: function (data) {
				let message = '';
				if (!data.execSuccess) {
					if (data.code === 'ERR_NETWORK') {
						message = 'Uh oh, looks like the network\'s down.';
					} else if (data.code === 'ERR_PASS_NOT_MATCH') {
						message = 'The old password doesn\'t match.';
					} else if (data.code === 'ERR_EMPTY') {
						message = 'The password can\'t be empty';
					} else {
						message = 'Hm some weird unknown error here, sorry...';
					}
					this.setState({
						message: message
					});
				} else {
					this.setState({
						message: 'Password updated!'
					});
				}
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
				<div className="small-header">
					Change password
				</div>
				<form className="password-change">
					<p>
						<Input.Input
							type="password"
							name="passwordOld"
							placeholder="Old password"
							className="form-control"
							fieldChange={this._fieldValues}
						/>
					</p>
					<p>
						<Input.Input
							type="password"
							name="passwordNew"
							placeholder="New password"
							className="form-control"
							fieldChange={this._fieldValues}
						/>
					</p>
					<p>
						<Button
							bsStyle="primary"
							onClick={() => this._changePassword(
								this.state.values.passwordOld,
								this.state.values.passwordNew
							)}
						>
							Change
						</Button>

						<span className="red">
							{this.state.message}
						</span>
					</p>
				</form>
			</div>
		);
	}
});

PasswordChangeBox.contextTypes = {
	router: React.PropTypes.object
};


const OverallRecords = React.createClass({
	getInitialState: function () {
		return {
			data: []
		};
	},
	componentDidMount: function () {
		this.getLeaderboardData(this.props.url, this.props.year);
	},
	getLeaderboardData: function (url, year) {
		$.ajax({
			type: 'GET',
			url: url,
			data: { year: year },
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(JSON.stringify(data));
				this.setState({
					data: data.data
				});
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	render: function () {
		if (this.state.data.length < 1) {
			return (
				<li>No past results for your leagues.</li>
			);
		}
		const recordNodes = this.state.data.map(function (row) {
			return (
				<RecordNode
					data={row}
				/>
			);
		});

		return (
			<tbody>
				{recordNodes}
			</tbody>
		);
	}
});

const RecordNode = React.createClass({
	viewLeague: function (leagueId) {
		this.context.router.push('/football/dashboard/league/' + leagueId + '/voting');
	},
	render: function () {
		const data = this.props.data;
		return (
			<tr className="pointer" onClick={() => this.viewLeague(data.league_id)}>
				<td>{data.league_name}</td>
				<td>{data.wins}</td>
				<td>{data.losses}</td>
				<td>{data.win_percentage}</td>
			</tr>
		);
	}
});

RecordNode.contextTypes = {
	router: React.PropTypes.object
};

module.exports = {
	ProfileContainer: ProfileContainer
};
