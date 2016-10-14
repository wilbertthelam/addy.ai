/* Wilbert Lam
09/27/2016
football_dashboard_voting.js

Contains components for the Dashboard's leaderboard section

*/

import React from 'react';
import $ from 'jquery';
import { Link } from 'react-router';
import { Button, Nav, NavItem, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';
import io from 'socket.io-client';

//=========================================
// ROUTER CONTAINER FOR THE VOTING SECTION
//=========================================
const VotingContainer = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			leagueId: this.props.params.leagueId
		};
	},
	componentDidMount: function () {
		// alert("voting container mounted");
		this.displayPage(this.props.params.leagueId);
		// alert('leagueId right now: ' + this.props.params.leagueId)
	},

	componentWillReceiveProps: function (nextProps) {
		// alert("voting container received new props")
		this.displayPage(nextProps.params.leagueId);
		// alert('leagueId updated: ' + nextProps.params.leagueId)
	},

	displayPage: function (leagueId) {
		$.ajax({
			type: 'GET',
			url: '/football/voting/matchupsWithUserVote',
			// TODO: MOVE OUT YEAR
			data: { leagueId: leagueId, year: 2016 },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login
				this.setState({ leagueId: leagueId, data: data.data });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/login');
			}.bind(this)
		});
	},

	render: function () {
		if (this.state.data == null) {
			return (
				<div>There aren't any teams in the league.</div>
			);
		}

		const voteNodes = this.state.data.map(function (matchup) {
			return (
				<MatchupNode
					data={matchup}
				/>
			);
		});

		if (voteNodes.length < 1) {
			return (
				<div>There aren't any teams in the league.</div>
			);
		}

		return (
			<div>
				{voteNodes}
			</div>
		);
	}
});

// TODO: BRING THIS TO BE DYNAMIC
const socket = io.connect('http://localhost:80');

const SocketTest = React.createClass({
	getInitialState: function () {
		return {
			number: 0
		};
	},
	componentDidMount: function () {
		alert('asdf')
		socket.on('voteNotif', this._updateVotingUI);
	},
	componentWillReceiveProps: function (nextProps) {

	},
	_updateVotingUI: function (data) {
		this.setState({ number: data.result })
	},
	render: function () {
		return (
			<div>
				{this.state.number}
			</div> 
		);
	}
});

// Each indivual matchup row for voting
const MatchupNode = React.createClass({
	getInitialState: function () {
		// winner is 0 or 1, represents whether the first team (0)
		// or second team (1) is currently winning
		return {
			winner: null,
			selectClass: ['', ''],
			activeClass: 'vote-selected'
		};
	},
	componentDidMount: function () {
		this.decideClasses(this.props.data);
	},
	componentWillReceiveProps: function (nextProps) {
		this.decideClasses(nextProps.data);
	},
	decideClasses: function (data) {
		const selectClass = ['', ''];
		let winner = null;
		if (data.team_1_active === 1) {
			selectClass[0] = this.state.activeClass;
			winner = 0;
		} else if (data.team_2_active === 1) {
			selectClass[1] = this.state.activeClass;
			winner = 1;
		}

		this.setState({ selectClass: selectClass, winner: winner });
	},
	updateActiveClasses: function () {
		// on state change, change the classes that highlight your pick

		const newSelectClass = this.state.selectClass;
		const winner = this.state.winner;
		newSelectClass[winner] = this.state.activeClass;
		newSelectClass[1 - winner] = '';
		this.setState({ selectClass: newSelectClass });
	},
	_vote: function (winningTeam) {
		// team 0 is the first team on the list,
		// team 1 is the second team on the list
		// if team is already selected, don't bother with the ajax vote update call
		// alert('winningTeam: ' + winningTeam + '   state winningteam: ' + this.state.winner);
		if (winningTeam !== this.state.winner || this.state.winner === null) {
			// get the winning and losing team
			let winningTeamId = this.props.data.team_id1;
			let losingTeamId = this.props.data.team_id2;
			if (winningTeam === 1) {
				winningTeamId = this.props.data.team_id2;
				losingTeamId = this.props.data.team_id1;
			}

			// submit vote via ajax call
			$.ajax({
				type: 'POST',
				url: '/football/voting/vote',
				data: {
					matchupId: this.props.data.matchup_id,
					winningTeamId: winningTeamId,
					losingTeamId: losingTeamId
				},
				dataType: 'json',
				cache: false,
				success: function (data) {
					console.log(JSON.stringify(data));
					if (!data.execSuccess) {
						console.log('Failed to update');
					} else {
						this.setState({ winner: winningTeam }, this.updateActiveClasses);
						this.updateNotifications();
					}
					
					console.log('successfully updated vote!');
				}.bind(this),
				error: function (status, err) {
					console.error(status, err.toString());
					// alert('no work');
				}.bind(this)
			});
		}
	},
	updateNotifications: function () {
		socket.emit('voteNotif', { userId: 1, leagueId: this.props.data.league_id });
	},
	render: function () {
		return (
			<div className="container matchup well">
				<div className="col-sm-5">
					<div className="team" onClick={() => this._vote(0)}>
						<div className={this.state.selectClass[0]}>
							<div className="owner-name">{this.props.data.owner_name1}</div>
							<div className="team-name">{this.props.data.team_name1}</div>
						</div>
					</div>
				</div>
				<div className="col-sm-2">
					<div id="vs">vs</div>
				</div>
				<div className="col-sm-5">
					<div className="team" onClick={() => this._vote(1)}>
						<div className={this.state.selectClass[1]}>
							<div className="owner-name">{this.props.data.owner_name2}</div>
							<div className="team-name">{this.props.data.team_name2}</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = {
	VotingContainer: VotingContainer,
};