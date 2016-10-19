/* Wilbert Lam
09/27/2016
football_dashboard.js

Contains components for the Dashboard

*/

import React from 'react';
import $ from 'jquery';
import { Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// ============================================
// ROUTER CONTAINER FOR THE DASHBOARD SECTION
// ============================================
const DashboardContainer = React.createClass({
	render: function () {
		return (
			<div>
				<ReactCSSTransitionGroup
					transitionName="example"
					transitionAppear={true}
					transitionAppearTimeout={500}
				>
					<ContentBox
						params={this.props.params}
						children={this.props.children}
						// location={this.props.location}
					/>
				</ReactCSSTransitionGroup>
			</div>
		);
	}
});

// allow for redirects inside the dashboard
DashboardContainer.contextTypes = {
	router: React.PropTypes.object
};


// contains the leaderboard/voting sections of the dashboard
const ContentBox = React.createClass({
	getInitialState: function () {
		return {
			activeTab: 1,
			leagueId: this.props.params.leagueId
		};
	},
	componentWillReceiveProps: function (nextProps) {
		if (nextProps.params.leagueId !== this.state.leagueId) {
			this.setState({
				leagueId: nextProps.params.leagueId,
				activeTab: 1 });
		} else {
			this.setState({
				leagueId: nextProps.params.leagueId });
		}
	},
	changeActiveTab: function (tab) {
		if (tab === 'voting') {
			this.setState({
				activeTab: 1
			});
		} else if (tab === 'leaderboard') {
			this.setState({
				activeTab: 2
			});
		} else {
			console.log('hm weird issue with the tab select');
		}
	},
	handleSelect: function (keyId) {
		if (keyId !== this.state.activeTab) {
			this.setState({ activeTab: keyId });
			const voteUrl = '/football/dashboard/league/' + this.state.leagueId + '/voting';
			const leaderboardUrl = '/football/dashboard/league/' + this.state.leagueId + '/leaderboard';
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
			<div className="col-md-12">
				<div className="">
					<LeagueTitle
						leagueId={this.props.params.leagueId}
					/>
				</div>
				<div className="voting-box shadow-z-1">
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

const tooltip = (
	<Tooltip id="tooltip">Leave league</Tooltip>
);

// Component that displays the league name
const LeagueTitle = React.createClass({
	getInitialState: function () {
		return {
			leagueName: '',
			leagueId: ''
		};
	},
	componentDidMount: function () {
		this._getLeagueName(this.props.leagueId);
	},
	componentWillReceiveProps: function (nextProps) {
		this._getLeagueName(nextProps.leagueId);
	},
	_getLeagueName: function (leagueId) {
		$.ajax({
			type: 'GET',
			url: '/football/league/leagueInfo',
			data: { leagueId: leagueId },
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({
					leagueName: data.data[0].league_name,
					leagueId: data.data[0].league_id
				});
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
			}
		});
	},
	_removeLeague: function (leagueId) {
		$.ajax({
			type: 'POST',
			url: '/football/league/removeLeagueForUser',
			data: { leagueId: leagueId },
			dataType: 'json',
			cache: false,
			success: function (data) {
				if (data.execSuccess) {
					this.context.router.push('/football/dashboard/leagues');
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
			}
		});
	},
	render: function () {
		return (
			<div className="league-header">
				<span>{this.state.leagueName}</span>
				<span
					className="remove-league-button"
				>
					<OverlayTrigger placement="left" overlay={tooltip}>
						<span
							className="glyphicon glyphicon-remove-circle remove-league-icon"
							aria-hidden="true"
							onClick={() => this._removeLeague(this.state.leagueId)}
						>
						</span>
					</OverlayTrigger>
				</span>
			</div>
		);
	}
});

LeagueTitle.contextTypes = {
	router: React.PropTypes.object
};

module.exports = {
	DashboardContainer: DashboardContainer,
	ContentBox: ContentBox,
};
