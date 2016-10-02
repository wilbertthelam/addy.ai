/* Wilbert Lam
09/27/2016
football_login.js

Contains components for the news

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Router, Route, Link, browserHistory } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';

const DashboardContainer = React.createClass({
	
	render: function () {
		return (
			<div>
				<ContentBox params={this.props.params} children={this.props.children} />
			</div>
		);
	}
});

DashboardContainer.contextTypes = {
	router: React.PropTypes.object
};

const NavBar = React.createClass({
	render: function () {
		return (
			<div className="nav-bar shadow-z-1">
				<ul>
					<li id="nav-bar-title">Your leagues:</li>
					<LeagueList
						baseUrl="/football/league/userLeagues"
					/>
					<li id="nav-bar-title">
						<Link to="/dashboard/leagues">Join leagues</Link>
					</li>
				</ul>
			</div>
		);
	}
});

const LeagueList = React.createClass({
	getInitialState: function () {
		return {
			data: []
		};
	},
	componentDidMount: function () {
		$.ajax({
			type: 'GET',
			url: this.props.baseUrl,
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login

				this.setState({ data: data.data });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/login');
			}.bind(this)
		});
	},

	render: function () {
		const leagueNodes = this.state.data.map(function (league) {
			return (
				<LeagueNode
					leagueId={league.league_id}
					leagueName={league.league_name}
				/>
			);
		});

		if (leagueNodes.length < 1) {
			return (
				<li>No leagues joined yet.</li>
			);
		}

		return (
			<div>
				{leagueNodes}
			</div>
		);
	}
});

const LeagueNode = React.createClass({
	render: function () {
		const url = '/dashboard/league/' + this.props.leagueId + '/voting';
		return (
			<li><Link to={url}>{this.props.leagueName}</Link></li>
		);
	}
});

const ContentBox = React.createClass({
	getInitialState: function () {
		return {
			activeTab: 1
		};
	},
	handleSelect: function (keyId) {
		if (keyId !== this.state.activeTab) {
			this.setState({ activeTab: keyId });
			const voteUrl = '/dashboard/league/' + this.props.params.leagueId + '/voting';
			const leaderboardUrl = '/dashboard/league/' + this.props.params.leagueId + '/leaderboard';
			if (keyId === 1) {
				this.context.router.push(voteUrl);
			} else {
				this.context.router.push(leaderboardUrl);
			}
		}
	},
	render: function () {
		console.log(JSON.stringify(this.props.params));


		return (
			<div className="login-box shadow-z-1">
				<Nav bsStyle="tabs" justified activeKey={this.state.activeTab} onSelect={this.handleSelect}>
					<NavItem eventKey={1}>Vote</NavItem>
					<NavItem eventKey={2}>Leaderboard</NavItem>
				</Nav>
				<div className="content-box">
					{this.props.children}
				</div>
			</div>
		);
	}
});

ContentBox.contextTypes = {
	router: React.PropTypes.object
};

const DefaultContainer = React.createClass({

	render: function () {
		return (
			<div>

				This is just the default thing 
			</div>
		);
	}
});

const VotingContainer = React.createClass({
	getInitialState: function () {
		return {
			data: [],
		};
	},
	componentDidMount: function () {
		$.ajax({
			type: 'GET',
			url: '/football/voting/matchups',
			data: { leagueId: this.props.params.leagueId },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login

				this.setState({ data: data.data });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/login');
			}.bind(this)
		});
	},

	render: function () {
		const voteNodes = this.state.data.map(function (matchup) {
			return (
				<MatchupNode
					data={matchup}
				/>
			);
		});

		if (voteNodes.length < 1) {
			return (
				<li>There aren't any teams in the league.</li>
			);
		}

		return (
			<div>
				{voteNodes}
			</div>
		);
	}
});

const MatchupNode = React.createClass({
	getInitialState: function() {
		// winner is 0 or 1, represents whether the first team (0)
		// or second team (1) is currently winning
		return {
			winner: null,
			selectClass: ['', ''],
			activeClass: 'vote-selected'
		};
	},
	componentDidMount: function () {
		// on load check to see which team has won from the particular matchup
		$.ajax({
			type: 'GET',
			url: '/football/voting/votingPicksForUser',
			data: { matchupId: this.props.data.matchup_id },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				if (!data.execSuccess) {
					console.log("Failed to update");
				} else {
					if (data.data.length > 0) {
						const voteRow = data.data[0];
						let winner = 0;
						if (voteRow.winning_team_id === this.props.data.team_id2) {
							winner = 1;
						}
						const newSelectClass = [];
						newSelectClass[winner] = this.state.activeClass;
						newSelectClass[1 - winner] = '';
						this.setState({selectClass: newSelectClass });
					}
					
				}
				console.log("populated user voting decision");
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				alert("no work");
			}
		});

	},
	updateActiveClasses: function () {
		// on state change, change the classes that highlight your pick

		const newSelectClass = this.state.selectClass;
		const winner = this.state.winner;
		newSelectClass[winner] = this.state.activeClass;
		newSelectClass[1 - winner] = '';
		this.setState({selectClass: newSelectClass });
	},
	vote: function (winningTeam) {
		// team 0 is the first team on the list,
		// team 1 is the second team on the list
		// if team is already selected, don't bother with the ajax vote update call
		if (winningTeam !== this.state.winner) {
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
				data: { matchupId: this.props.data.matchup_id, winningTeamId: Number(winningTeamId), losingTeamId: Number(losingTeamId) },
				dataType: 'json',
				cache: false,
				success: function (data) {
					console.log(JSON.stringify(data));
					if (!data.execSuccess) {
						console.log("Failed to update");
					} else {
						this.setState({ winner: winningTeam }, this.updateActiveClasses);
					}
					
					console.log("successfully updated vote!");
				}.bind(this),
				error: function (status, err) {
					console.error(status, err.toString());
					alert("no work");
				}.bind(this)
			});
		}
	},
	render: function () {
		return (
			<div className="container matchup well">
				<div className="col-sm-5">
					<div className="team" onClick={() => this.vote(0)}>
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
					<div className="team" onClick={() => this.vote(1)}>
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

const LeaderboardContainer = React.createClass({
	render: function () {
		return (
			<div>
				THIS IS THE LEADERBOARD
			</div>
		);
	}
});


module.exports = {
	DashboardContainer: DashboardContainer,
	VotingContainer: VotingContainer,
	LeaderboardContainer: LeaderboardContainer,
	NavBar: NavBar,
	ContentBox: ContentBox,
	DefaultContainer: DefaultContainer
};
