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

const ProfileBox = React.createClass({
	render: function () {
		return (
			<div>
				<div className="col-md-4">
					<div className="shadow-z-1 content-box">
						<UserInfo
							url="/football/league/user"
						/>
					</div>
				</div>

				<div className="col-md-8">
					<div className="shadow-z-1 content-box">
						<div className="table-responsive-vertical">
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
				userId: ''
			}
		};
	},
	componentDidMount: function () {
		this.getUserInfo(this.props.url);
	},
	getUserInfo: function (url) {
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				//console.log(JSON.stringify(data));
				this.setState({ data: data.data[0] });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/login');
			}.bind(this)
		});
	},
	capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	render: function () {
		return (
			<div>
				<p>Name: <br /> <span className="bold">{this.capitalize(this.state.data.first_name)} {this.capitalize(this.state.data.last_name)}</span></p>
				<p>Email: <br /> <span className="bold">{this.state.data.email} </span></p>
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
				this.context.router.push('/login');
			}.bind(this)
		})
	},
	render: function () {
		if (this.state.data.length < 1) {
			return (
				<li>You aren't in any leagues.</li>
			);
		}
		const recordNodes = this.state.data.map(function (row) {
			return (
				<RecordNode
					data={row}
				/>
			);
		})

		return (
			<tbody>
				{recordNodes}		
			</tbody>
		);
	}
});

const RecordNode = React.createClass({
	viewLeague: function (leagueId) {
		this.context.router.push('/dashboard/league/' + leagueId + '/voting');
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
	ProfileBox: ProfileBox
};