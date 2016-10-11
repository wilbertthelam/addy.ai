/* Wilbert Lam
09/27/2016
football_dashboard.js

Contains components for the Dashboard

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Router, Route, Link, browserHistory } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';


// ============================================
// ROUTER CONTAINER FOR THE DASHBOARD SECTION
// ============================================
const DashboardContainer = React.createClass({
	render: function () {
		return (
			<div>
				<ContentBox
					params={this.props.params}
					children={this.props.children}
					//location={this.props.location}
				/>
			</div>
		);
	}
});

// allow for redirects inside the dashboard
DashboardContainer.contextTypes = {
	router: React.PropTypes.object
};



//=========================================
// NAVIGATION BAR ON THE SIDE
//=========================================
const NavBar = React.createClass({
	getInitialState: function () {
		return {
			activeLeagueId: this.props.activeLeagueId
		};
	},
	componentDidMount: function () {
		//alert('mounted')
	},
	componentWillReceiveProps: function (nextProps) {
		//alert('updated')
		// this.setState({ nextProps.activeLeagueId });
	},
	render: function () {
		return (
			<div className="nav-bar shadow-z-1">
				<ul>
					<li className="nav-bar-title">
						<Link to="/dashboard/">
							<span className="glyphicon glyphicon-user" aria-hidden="true"></span> Profile
						</Link>
					</li>
					<li className="nav-bar-title">
						<span className="glyphicon glyphicon-th-list" aria-hidden="true"></span> Your leagues
					</li>
					<LeagueList
						baseUrl="/football/league/userLeagues"
						activeLeagueId={this.state.activeLeagueId}
					/>
					<li className="nav-bar-title">
						<Link to="/dashboard/leagues">
							<span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Join leagues
						</Link>
					</li>
				</ul>
			</div>
		);
	}
});

const LeagueList = React.createClass({
	getInitialState: function () {
		return {
			data: [],
			activeLeagueId: this.props.activeLeagueId
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
				this.context.router.push('/login');
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
				/>
			);
		});

		if (leagueNodes.length < 1) {
			return (
				<li>No leagues joined yet.</li>
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
			activeClass: this.props.activeClass
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({ activeClass: nextProps.activeClass });
	},
	indexSelected: function (leagueId, url) {
		console.log('got selected baby!' + leagueId);
		this.props.setActiveLeagueId(leagueId, url);
	},

	render: function () {
		const url = '/dashboard/league/' + this.props.leagueId + '/voting';
		return (
			<div className="league-menu-row">
				<li
					className={this.state.activeClass}
					onClick={() => this.indexSelected(this.props.leagueId, url)}
				>
					{this.props.leagueName}
				</li>
			</div>
		);
	}
});

const ContentBox = React.createClass({
	getInitialState: function () {
		return {
			activeTab: 1,
			leagueId: this.props.params.leagueId
		};
	},
	componentWillReceiveProps: function (nextProps) {
		let activeTab = 1;
		if (nextProps.params.leagueId !== this.state.leagueId) {
			this.setState({ leagueId: nextProps.params.leagueId, activeTab: 1 });
		} else {
			this.setState({ leagueId: nextProps.params.leagueId });
		}
		
	},
	changeActiveTab: function (tab) {
		if (tab === 'voting') {
			this.setState({ activeTab: 1 });
		} else if (tab === 'leaderboard') {
			this.setState({ activeTab: 2 });
		} else {
			console.log('hm weird issue with the tab select');
		}
	},
	handleSelect: function (keyId) {
		if (keyId !== this.state.activeTab) {
			this.setState({ activeTab: keyId });
			const voteUrl = '/dashboard/league/' + this.state.leagueId + '/voting';
			const leaderboardUrl = '/dashboard/league/' + this.state.leagueId + '/leaderboard';
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
			<div>
				<div className="shadow-z-1 content-box">
					<LeagueTitle 
						leagueId={this.props.params.leagueId}
					/>
				</div>
				<div className="login-box shadow-z-1">
					<Nav
						bsStyle="tabs"
						justified
						activeKey={this.state.activeTab}
						onSelect={this.handleSelect}
					>
						<NavItem eventKey={1}>Vote</NavItem>
						<NavItem eventKey={2}>Leaderboard</NavItem>
					</Nav>
					<div className="content-box">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
});

ContentBox.contextTypes = {
	router: React.PropTypes.object
};

// Component that displays the league name
const LeagueTitle = React.createClass({
	getInitialState: function () {
		return {
			leagueName: ''
		};
	},
	componentDidMount: function () {
		this.getLeagueName(this.props.leagueId);
	},
	componentWillReceiveProps: function (nextProps) {
		this.getLeagueName(nextProps.leagueId);
	},
	getLeagueName: function (leagueId) {
		$.ajax({
			type: 'GET',
			url: '/football/league/leagueInfo',
			data: { leagueId: leagueId },
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({ leagueName: data.data[0].league_name });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
			}
		});
	},
	render: function () {
		return (
			<div className="league-header">
				{this.state.leagueName}
			</div>
		);
	}
});


//=========================================
// ROUTER CONTAINER FOR THE DEFAULT SECTION
//=========================================
const DefaultContainer = React.createClass({

	render: function () {
		return (
			<div>
				<div className="shadow-z-1 content-box">
					<div className="league-header">Profile</div>
				</div>
			
				<div className="content-box shadow-z-1">
					This is just the default thing
				</div>
			</div>
		);
	}
});



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
	vote: function (winningTeam) {
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
					}
					
					console.log('successfully updated vote!');
				}.bind(this),
				error: function (status, err) {
					console.error(status, err.toString());
					alert('no work');
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



//==============================================
// ROUTER CONTAINER FOR THE LEADERBOARD SECTION
//==============================================
const LeaderboardContainer = React.createClass({
	render: function () {
		// TODO: years add selection
		return (
			<div>
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
							url="/football/voting/leaderboard"
							leagueId={this.props.params.leagueId}
							year="2016"
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
		this.getLeaderboardData(this.props.url);
	},
	getLeaderboardData: function (url) {
		$.ajax({
			type: 'GET',
			url: url,
			// TODO: include week
			data: { leagueId: this.props.leagueId, year: this.props.year },
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
	capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	render: function () {
		return (
			<tr>
				<td>
					{this.capitalize(this.state.data.first_name)} 
					{this.capitalize(this.state.data.last_name)}
				</td>
				<td>{this.state.data.wins}</td>
				<td>{this.state.data.losses}</td>
				<td>{this.state.data.win_percentage}</td>
			</tr>
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
