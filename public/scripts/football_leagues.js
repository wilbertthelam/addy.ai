/* Wilbert Lam
09/27/2016
football_leagues.js

Contains components for the join leagues section of the website

*/

import React from 'react';
import $ from 'jquery';
import { Button } from 'react-bootstrap';
import * as QueryString from 'query-string';
import Loading from 'react-loading';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const LeagueContainer = React.createClass({
	render: function () {
		return (
			<div>
				<ReactCSSTransitionGroup
					transitionName="example"
					transitionAppear={true}
					transitionAppearTimeout={500}
				>
					<div className="col-md-6">
						<div className="shadow-z-1 content-box">
							<div className="league-header small-header">Available leagues</div>
						</div>

						<div className="shadow-z-1 content-box">
							<LeagueList
								baseUrl="/football/league/availableLeagues"
							/>
						</div>
					</div>

					<div className="col-md-6">
						<div className="shadow-z-1 content-box">
							<div className="league-header small-header">Can't find a league?</div>
						</div>
						<div className="shadow-z-1 content-box">
							<AddLeague />
						</div>
					</div>
				</ReactCSSTransitionGroup>
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
		this._getLeagueList();
	},
	_getLeagueList: function () {
		$.ajax({
			type: 'GET',
			url: this.props.baseUrl,
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
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
				<li>No leagues available.</li>
			);
		}
		const that = this;
		const leagueNodes = this.state.data.map(function (league) {
			return (
				<LeagueNode
					leagueId={league.league_id}
					leagueName={league.league_name}
					getLeagueList={that._getLeagueList}
				/>
			);
		});

		return (
			<div>
				{leagueNodes}
			</div>
		);
	}
});

const LeagueNode = React.createClass({
	_joinLeague: function () {
		$.ajax({
			type: 'POST',
			url: '/football/league/addLeagueForUser',
			data: { leagueId: this.props.leagueId },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				if (data.execSuccess === false) {
					console.log('error could not add league');
				} else {
					console.log('succesfully added');
					this.context.router.push('/football/dashboard/leagues');
					this.props.getLeagueList();
				}
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				// alert('error connecting');
			}
		});
	},
	render: function () {
		return (
			<div className="league-rows">
				<Button
					bsStyle="primary"
					bsSize="xsmall"
					onClick={this._joinLeague}
				>
					<span className="glyphicon glyphicon-plus" /> join
				</Button>
				<span className="league-row">{this.props.leagueName}</span>
			</div>
		);
	}
});

LeagueNode.contextTypes = {
	router: React.PropTypes.object
};

const AddLeague = React.createClass({
	getInitialState: function () {
		return {
			url: '',
			message: '',
			displayResult: false,
			displayLoader: false,
			leageueId: '',
			leagueName: ''
		};
	},
	createLeague: function () {
		this.setState({
			displayResult: false,
			displayLoader: true,
			message: ''
		});
		const urlSections = this.state.url.split('?');
		let parameterString = '';
		if (urlSections.length <= 1) {
			this.setState({
				displayLoader: false,
				message: 'This URL is invalid, try another one!'
			});
		} else {
			parameterString = urlSections[1];

			const parsed = QueryString.parse(parameterString);
			if (!parsed.leagueId) {
				// invalid url
				console.log('do prevent here');
				this.setState({
					displayLoader: false,
					message: 'This URL is invalid, try another one!'
				});
			} else {
				$.ajax({
					type: 'POST',
					url: '/football/tasks/createNewLeague',
					data: {
						espnId: parsed.leagueId,
						seasonId: ''
					},
					dataType: 'json',
					cache: false,
					success: function (data) {
						this.setState({
							displayLoader: false
						});
						console.log(JSON.stringify(data));
						// if successfully logged in, open dashboard, else redirect to login
						if (data.execSuccess === false) {
							console.log('error could not add league');
							if (data.code === 'ERR_DUPLICATE_ESPN_ID') {
								// if already exists, then make a ajax call to get the leagueId
								$.ajax({
									type: 'GET',
									url: '/football/league/leagueInfoESPNSeason',
									data: {
										espnId: parsed.leagueId,
										seasonId: ''
									},
									dataType: 'json',
									cache: false,
									success: function (data2) {
										this.setState({
											displayResult: true,
											leagueId: data2.data[0].league_id,
											leagueName: data2.data[0].league_name
										});
									}.bind(this),
									error: function (status, err) {
										console.error(status, err.toString());
										this.setState({
											message: 'Hm, looks like the servers are down. Try again in a bit!'
										});
										// print network error warning
									}.bind(this)
								});
							} else if (data.code === 'ERR_PRIVATE_NOT_EXIST') {
								const message = 'Sorry, the league is privated or does not exist! ' +
									'Ask your league manager to make your league public!';
								this.setState({
									message: message
								});
							} else if (data.code === 'ERR_INV_LEAGUE_TYPE') {
								const message = 'Sorry, addy.ai currently only ' +
									'works with ESPN standard H2H point leagues.';
								this.setState({
									message: message
								});
							} else {
								this.setState({
									message: 'Some strange error happened, try again in a bit!'
								});
							}
							// could not add league
							// return message saying if wrong type or league is privated or does not exist
						} else {
							console.log('successfully added');
							this.setState({
								displayResult: true,
								leagueId: data.data.league_id,
								leagueName: data.data.league_name
							});
							// place option for the league to show up below
						}
					}.bind(this),
					error: function (status, err) {
						this.setState({
							displayLoader: false
						});
						console.error(status, err.toString());
						this.setState({
							message: 'Hm, looks like the servers are down. Try again in a bit!'
						});
						// print network error warning
					}.bind(this)
				});
			}
		}
	},

	updateUrl: function (e) {
		this.setState({
			url: e.target.value
		});
	},

	render: function () {
		let resultComponent;
		if (this.state.displayResult) {
			// alert('display thing here : ' + this.state.leagueId);
			resultComponent = (
				<LeagueNode
					leagueId={this.state.leagueId}
					leagueName={this.state.leagueName}
				/>
			);
		}
		const displayLoaderComponent = (
			<Loading
				type="spin"
				color="#e3e3e3"
				delay="0"
				height="20"
				width="20"
			/>
		);

		return (
			<div>
				<p>
					Simply paste in a URL from your ESPN fantasy football league and addy.ai will do the rest!
				</p>
				<p>
					<input
						type="text"
						name="espnURL"
						placeholder="ESPN fantasy football league URL"
						className="form-control"
						value={this.state.url}
						onChange={this.updateUrl}
					/>
				</p>
				<div className="league-submit">
					<div className="leaderboard-menu-item">
						<Button
							bsStyle="primary"
							onClick={this.createLeague}
							disabled={this.state.displayLoader}
						>
							{this.state.displayLoader ? displayLoaderComponent : 'Search'}
						</Button>
					</div>
					<div className="leaderboard-menu-item">
						<span className="warning">
							{this.state.message}
						</span>
					</div>
				</div>

				<div>
					{resultComponent}
				</div>
			</div>
		);
	}
});

module.exports = {
	LeagueContainer: LeagueContainer,
};
