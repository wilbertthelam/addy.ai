/* Wilbert Lam
09/27/2016
football_dashboard_voting.js

Contains components for the Dashboard's leaderboard section

*/

import React from 'react';
import $ from 'jquery';
import { Button, ButtonToolbar, ButtonGroup,
	Collapse, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { socket } from './football_socket.js';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// =========================================
// ROUTER CONTAINER FOR THE VOTING SECTION
// =========================================
const VotingContainer = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			leagueId: this.props.params.leagueId,
			userId: '',
			currentWeek: 0,
			selectedWeek: 0,
			currentYear: 0
		};
	},
	componentDidMount: function () {
		// alert("voting container mounted");
		this._getUser();
		this._getInitialTime();
	},

	componentWillReceiveProps: function (nextProps) {
		// alert("voting container received new props")
		this._getUser();
		this._displayPage(nextProps.params.leagueId, this.state.currentWeek, this.state.currentYear);
	},
	_getInitialTime: function () {
		$.ajax({
			type: 'GET',
			url: '/football/league/time',
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({
					currentWeek: data.data.week,
					currentYear: data.data.year
				}, this._displayPage(this.props.params.leagueId, data.data.week, data.data.year));
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
			}
		});
	},
	_displayPage: function (leagueId, week, year) {
		$.ajax({
			type: 'GET',
			url: '/football/voting/matchupsWithUserVote',
			// TODO: MOVE OUT YEAR
			data: { leagueId: leagueId, week: week, year: year },
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login
				this.setState({ leagueId: leagueId, data: data.data, selectedWeek: week });
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
				// console.log(JSON.stringify(data));
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
	_updateWeek: function (leagueId, week, year) {
		this._displayPage(leagueId, week, year);
	},
	render: function () {
		if (this.state.data == null) {
			return (
				<div>There aren't any teams in the league.</div>
			);
		}

		const that = this;
		const voteNodes = this.state.data.map(function (matchup) {
			return (
				<MatchupNode
					data={matchup}
					userId={that.state.userId}
					currentWeek={that.state.currentWeek}
					selectedWeek={that.state.selectedWeek}
				/>
			);
		});

		if (voteNodes.length < 1) {
			return (
				<div>There aren't any teams in the league.</div>
			);
		}

		const weekList = [];
		for (let i = 0; i < this.state.currentWeek; i++) {
			weekList[i] = i + 1;
		}

		const buttons = weekList.map(function (week) {
			let style = 'default';
			if (week === that.state.currentWeek) {
				style = 'primary';
			}
			return (
				<Button
					active={week === that.state.selectedWeek}
					onClick={() => that._updateWeek(that.state.leagueId, week, that.state.currentYear)}
					bsStyle={style}
				>
					{week}
				</Button>);
		});

		return (
			<div>
				<ReactCSSTransitionGroup
					transitionName="example"
					transitionAppear={true}
					transitionAppearTimeout={500}
				>
					<div className="voting-week-menu">
						<ButtonToolbar>
							<ButtonGroup>
								<Button>Week: </Button>
								{buttons}
							</ButtonGroup>
						</ButtonToolbar>
					</div>
					{voteNodes}
				</ReactCSSTransitionGroup>
			</div>
		);
	}
});

const tooltip = (
	<Tooltip id="tooltip">View details</Tooltip>
);

// Each indivual matchup row for voting
const MatchupNode = React.createClass({
	getInitialState: function () {
		// winner is 0 or 1, represents whether the first team (0)
		// or second team (1) is currently winning
		return {
			winner: null,
			winningId: '',
			losingId: '',
			selectClass: ['', ''],
			activeClass: 'vote-selected',
			teamId1: '',
			teamId2: '',
			actualResult: {
				actualWinnerId: '',
				actualLoserId: '',
				actualWinningScore: '',
				actualLosingScore: ''
			},
			open: false, // open is for the collapse details,
			matchupId: ''
		};
	},
	componentDidMount: function () {
		this._decideClasses(this.props.data);
	},
	componentWillReceiveProps: function (nextProps) {
		this._decideClasses(nextProps.data);
	},
	_decideClasses: function (data) {
		const selectClass = ['', ''];

		// determine the user's selection
		let winner = null;
		if (data.team_1_active === 1) {
			selectClass[0] = this.state.activeClass;
			winner = 0;
		} else if (data.team_2_active === 1) {
			selectClass[1] = this.state.activeClass;
			winner = 1;
		}

		// if there's a score available, give the actual result
		if (data.actual_winner_id !== null && data.actual_loser_id !== null) {
			this.setState({
				actualResult: {
					actualWinningId: data.actual_winner_id,
					actualLosingId: data.actual_loser_id,
					actualWinningScore: data.actual_winning_score,
					actualLosingScore: data.actual_losing_score
				}
			});
		}
		this.setState({
			selectClass: selectClass,
			winner: winner,
			winningId: data.winning_team_id,
			losingId: data.losing_team_id,
			matchupId: data.matchup_id,
			teamId1: data.team_id1,
			teamId2: data.team_id2
		});
	},
	_updateActiveClasses: function () {
		// on state change, change the classes that highlight your pick

		const newSelectClass = this.state.selectClass;
		const winner = this.state.winner;
		newSelectClass[winner] = this.state.activeClass;
		newSelectClass[1 - winner] = '';
		this.setState({ selectClass: newSelectClass });
	},
	_vote: function (winningTeam) {
		// if voting is locked, then don't proceed
		if (this.props.data.locked === 0) {
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
							this.setState({
								winner: winningTeam
							}, this._updateActiveClasses);
							this._updateNotifications();
						}
						console.log('successfully updated vote!');
					}.bind(this),
					error: function (status, err) {
						console.error(status, err.toString());
						// alert('no work');
					}
				});
			}
		}
	},
	_updateNotifications: function () {
		socket.emit('voteNotif', { userId: this.props.userId, leagueId: this.props.data.league_id });
	},
	_expandDetails: function () {
		this.setState({
			open: !this.state.open
		});
	},
	_decorateScore: function (text) {
		return '(' + text + ' pts)';
	},
	render: function () {
		let leftBarIcon = (
			<div className="result-icon">
				<span className="glyphicon glyphicon-option-horizontal" aria-hidden="true"></span>
			</div>
		);
		if (this.props.currentWeek !== this.props.selectedWeek) {
			leftBarIcon = (
				<LeftBarIcon
					winningId={this.state.winningId}
					actualWinningId={this.state.actualResult.actualWinningId}
					actualWinningScore={this.state.actualResult.actualWinningScore}
					actualLosingScore={this.state.actualResult.actualLosingScore}
				/>
			);
		}
		let score1 = '';
		let score2 = '';
		if (this.props.currentWeek !== this.props.selectedWeek) {
			if (this.state.actualResult.actualWinningId === this.state.teamId1) {
				score1 = this._decorateScore(this.state.actualResult.actualWinningScore);
				score2 = this._decorateScore(this.state.actualResult.actualLosingScore);
			} else {
				score1 = this._decorateScore(this.state.actualResult.actualLosingScore);
				score2 = this._decorateScore(this.state.actualResult.actualWinningScore);
			}
		}

		return (
			<div className="container matchup well">
				<OverlayTrigger placement="left" overlay={tooltip}>
					<div className="col-sm-1 left-icon-container" onClick={() => this._expandDetails()}>
						{leftBarIcon}
					</div>
				</OverlayTrigger>

				<div className="col-sm-5">
					<div className="team" onClick={() => this._vote(0)}>
						<div className={this.state.selectClass[0]}>
							<div className="owner-name">{this.props.data.owner_name1}</div>
							<div className="team-name">{score1} {this.props.data.team_name1}</div>
						</div>
					</div>
				</div>

				<div
					className="col-sm-1 matchup-middle"
					onClick={() => this._expandDetails(this.state.matchupId)}
				>
					<div className="">
						<div className="vs">
							{this.props.data.locked === 0 ?
								<span>vs</span> :
								<span className="glyphicon glyphicon-lock" aria-hidden="true"></span>}
						</div>
					</div>

				</div>
				<div className="col-sm-5">
					<div className="team" onClick={() => this._vote(1)}>
						<div className={this.state.selectClass[1]}>
							<div className="owner-name">{this.props.data.owner_name2}</div>
							<div className="team-name">{score2} {this.props.data.team_name2}</div>
						</div>
					</div>
				</div>

				<Collapse
					in={this.state.open}
				>
					<div>
						<MatchupDetails
							matchupId={this.state.matchupId}
						/>
					</div>
				</Collapse>
			</div>
		);
	}
});

const MatchupDetails = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			matchupId: this.props.matchupId,
			voted1: [],
			voted2: []
		};
	},
	componentDidMount: function () {
		this._getMatchupDetails(this.props.matchupId);
	},
	componentWillReceiveProps: function (nextProps) {
		this._getMatchupDetails(nextProps.matchupId);
	},
	_getMatchupDetails: function (matchupId) {
		$.ajax({
			type: 'GET',
			url: '/football/voting/matchupdetails',
			data: {
				matchupId: matchupId,
			},
			dataType: 'json',
			cache: false,
			success: function (data) {
				this._organizeMatchupDetails(data.data);
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				// alert('no work');
			}
		});
	},
	_organizeMatchupDetails: function (data) {
		const voted1 = [];
		const voted2 = [];

		for (let i = 0; i < data.length; i++) {
			const userResult = data[i];
			if (userResult.winning_team_id === userResult.team_id1) {
				voted1.push(userResult);
			} else if (userResult.winning_team_id === userResult.team_id2) {
				voted2.push(userResult);
			}
		}
		this.setState({
			voted1: voted1,
			voted2: voted2
		});
	},
	render: function () {
		return (
			<div className="col-md-12 matchup-details-container">
				<div className="col-md-1">

				</div>
				<div className="col-md-5">
					<VotedFor data={this.state.voted1} />
				</div>

				<div className="col-md-1 expand-button">

				</div>

				<div className="col-md-5">
					<VotedFor data={this.state.voted2} />
				</div>
			</div>
		);
	}
});

const VotedFor = React.createClass({
	_capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	render: function () {
		const that = this;
		const userNodes = this.props.data.map(function (user) {
			return (
				<li>
					{that._capitalize(user.first_name)} {that._capitalize(user.last_name)}
				</li>
			);
		});

		return (
			<div className="team">
				<span className="supporters-label">
					<span className="glyphicon glyphicon-thumbs-up bold" aria-hidden="true"></span>
						&nbsp;{this.props.data.length} {this.props.data.length === 1 ? 'vote' : 'votes'}
				</span>
				<ul>
					{userNodes}
				</ul>
			</div>
		);
	}
});

const LeftBarIcon = React.createClass({
	getInitialState: function () {
		return {
			actualWinningId: this.props.actualWinningId,
			winningId: this.props.winningId,
			showDetails: false,
			data: this.props.data,
			actualWinningScore: this.props.actualWinningScore,
			actualLosingScore: this.props.actualLosingScore
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({
			actualWinningId: nextProps.actualWinningId,
			winningId: nextProps.winningId,
			actualWinningScore: nextProps.actualWinningScore,
			actualLosingScore: nextProps.actualLosingScore
		});
	},
	_showDetails: function () {
		this.setState({ showDetails: true });
	},
	_hideDetails: function () {
		this.setState({ showDetails: false });
	},
	render: function () {
		return (
			<div
				className="result-icon"
				onMouseOver={this._showDetails}
				onMouseOut={this._hideDetails}
			>
				{(this.state.winningId === this.state.actualWinningId
					&& this.state.actualWinningId !== '') ?
					<span className="glyphicon glyphicon-ok-circle green" aria-hidden="true" ></span> :
					<span className="glyphicon glyphicon-ban-circle red" aria-hidden="true"></span>}
			</div>
		);
	}
});
module.exports = {
	VotingContainer: VotingContainer,
};
