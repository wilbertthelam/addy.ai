/* Wilbert Lam
09/27/2016
football_dashboard_leaderboard.js

Contains components for the Dashboard

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Link } from 'react-router';
import { Button, Nav, NavItem, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';


//==============================================
// ROUTER CONTAINER FOR THE LEADERBOARD SECTION
//==============================================
const LeaderboardContainer = React.createClass({
	getInitialState: function () {
		return {
			currentWeek: 0,
			selectedWeek: 0,
			url: '/football/voting/leaderboard',
			activeMenuItem: 'Cumulative'
		};
	},
	componentDidMount: function () {
		$.ajax({
			type: 'GET',
			url: '/football/league/week',
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({ currentWeek: data.data.week});
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
			}.bind(this)
		});
	},
	updateTable: function (eventKey) {
		//alert('clocked');
		console.log('did updateTable');
		if (eventKey === 'cumulative') {
			this.setState({ url: '/football/voting/leaderboard', selectedWeek: 0, activeMenuItem: 'Cumulative' });
		} else {
			this.setState({ url: '/football/voting/leaderboardByWeek', selectedWeek: eventKey, activeMenuItem: 'Week ' + eventKey });
		}
	},
	render: function () {
		const weekList = [];
		for (let i = 0; i < this.state.currentWeek - 1; i++) {
			weekList[i] = this.state.currentWeek - 1 - i;
		}
		const that = this;
		// TODO: years add selection
		return (
			<div>
				<span>
					<ButtonToolbar>
						<DropdownButton
							id="dropdown-size-medium"
							key="cumulative"
							title={this.state.activeMenuItem}
						>
							<MenuItem eventKey="cumulative" onSelect={that.updateTable}>Cumulative</MenuItem>
							<MenuItem divider />
								{weekList.map(function (data) {
								return (<MenuItem eventKey={data} onSelect={that.updateTable}>Week {data}</MenuItem>);
							})}
						</DropdownButton>
					</ButtonToolbar>
					*note: forgetting to vote is recorded as a loss
				</span>


				<div className="table-responsive-vertical">
					<table className="table table-hover table-mc-amber">
						<thead>
							<tr>
								<th>User</th>
								<th>Wins</th>
								<th>Losses</th>
								<th>Win % </th>
							</tr>
						</thead>
						<LeaderboardList
							url={this.state.url}
							leagueId={this.props.params.leagueId}
							year="2016"
							week={this.state.selectedWeek}
						/>
					</table>
				</div>
			</div>
		);
	}
});

const LeaderboardList = React.createClass({
	getInitialState: function () {
		return {
			data: []
		};
	},
	componentDidMount: function () {
		// alert(this.props.leagueId);
		// alert("leadeboard container mounted");
		this.getLeaderboardData(this.props.url, this.props.week, this.props.year, this.props.leagueId);
	},
	componentWillReceiveProps: function (nextProps) {
		this.getLeaderboardData(nextProps.url, nextProps.week, nextProps.year, nextProps.leagueId);
	},
	getLeaderboardData: function (url, week, year, leagueId) {
		$.ajax({
			type: 'GET',
			url: url,
			// TODO: include week
			data: { leagueId: leagueId, year: year, week: week },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login
				if (data.execSuccess === false) {
					console.log('error could not get leaderboard data.');
				} else {
					// alert(this.props.leagueId)
					this.setState({ data: data.data });
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
			}.bind(this)
		});
	},
	render: function () {
		const nodes = this.state.data.map(function (result) {
			return (
				<LeaderboardRow
					data={result}
				/>
			);
		});

		return (
			<tbody>
				{nodes}
			</tbody>
		);
	}
});

const LeaderboardRow = React.createClass({
	getInitialState: function () {
		return {
			data: this.props.data
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({ data: nextProps.data });
	},
	capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	render: function () {
		return (
			<tr>
				<td>
					{this.capitalize(this.state.data.first_name)} {this.capitalize(this.state.data.last_name)}
				</td>
				<td>{this.state.data.wins}</td>
				<td>{this.state.data.losses}</td>
				<td>{this.state.data.win_percentage}</td>
			</tr>
		);
	}
});

module.exports = {
	LeaderboardContainer: LeaderboardContainer,
};