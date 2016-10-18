/* Wilbert Lam
10/11/2016
football_profile.js

Contains components for the profile page

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Button, Nav, NavItem } from 'react-bootstrap';
import * as QueryString from 'query-string';
import Loading from 'react-loading';
const moment = require('moment');

//=========================================
// ROUTER CONTAINER FOR THE PROFILE SECTION
//=========================================
const ProfileContainer = React.createClass({

	render: function () {
		return (
			<div>
				<div className="col-md-12">
					<div className="">
						<div className="league-header">Profile</div>
					</div>
				</div>

				<ProfileBox />
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
				this.setState({ data: data.data[0], createTime: this.formatDate(data.data[0].create_time) });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/football/login');
			}.bind(this)
		});
	},
	capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	formatDate: function (date) {
		const t = date.split(/[- : T]/);
		const d = new Date(t[0], t[1] - 1, t[2]);
		return moment(d).format('MMMM Do YYYY');
	},
	render: function () {
		return (
			<div className="profile-info">
				<div>Name: <br /> <span className="bold">{this.capitalize(this.state.data.first_name)} {this.capitalize(this.state.data.last_name)}</span></div>
				<div>Email: <br /> <span className="bold">{this.state.data.email} </span></div>
				<div>Joined: <br /> <span className="bold">{this.state.createTime} </span></div>
			</div>
		);
	}
});

const OverallRecords = React.createClass({
	getInitialState: function () {
		return {
			data: []
		};
	},
	componentDidMount: function () {
		this.getLeaderboardData(this.props.url, this.props.year)
	},
	getLeaderboardData: function (url, year) {
		$.ajax({
			type: 'GET',
			url: url,
			data: { year: year },
			dataType: 'json',
			cache: false,
			success: function (data) {
				//console.log(JSON.stringify(data));
				this.setState({ data: data.data });
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
			<tr className="pointer" onClick={() => this.viewLeague(data.league_id) }>
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