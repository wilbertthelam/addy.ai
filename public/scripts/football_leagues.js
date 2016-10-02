/* Wilbert Lam
09/27/2016
football_leagues.js

Contains components for the leagues page

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Router, Route, Link, browserHistory } from 'react-router';
import { Button, Nav, NavItem } from 'react-bootstrap';
import * as QueryString from 'query-string';

const LeagueContainer = React.createClass({
	render: function () {
		return (
			<div className="">
				<div className="col-md-6">
					<div className="shadow-z-1 content-box">
						<div className="league-header">Available leagues</div>
					</div>
					
					<div className="shadow-z-1 content-box">
						<LeagueList 
							baseUrl="/football/league/availableLeagues"
						/>
					</div>
				</div>

				<div className="col-md-6">
					<div className="shadow-z-1 content-box">
						<div className="league-header">Can't find a league?</div>
					</div>
					<div className="shadow-z-1 content-box">
						<AddLeague />
					</div>
				</div>
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
		if (this.state.data.length < 1) {
			return (
				<li>No leagues created yet.</li>
			);
		}
		const leagueNodes = this.state.data.map(function (league) {
			return (
				<LeagueNode
					leagueId={league.league_id}
					leagueName={league.league_name}
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
	joinLeague: function () {
		$.ajax({
			type: 'POST',
			url: '/football/league/addLeagueForUser',
			data: { leagueId: this.props.leagueId },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(JSON.stringify(data));
				// if successfully logged in, open dashboard, else redirect to login
				if (data.execSuccess === false) {
					alert('error could not add league');
				} else {
					alert('succesfully added');
				}
				
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				alert('error connecting');
			}.bind(this)
		});
	},
	render: function () {
		return (
			<div className="league-rows">
				<Button
					bsStyle="primary"
					bsSize="xsmall"
					onClick={this.joinLeague}
				>
					<span className="glyphicon glyphicon-plus" /> join
				</Button>
				<span className="league-row">{this.props.leagueName} ({this.props.leagueId})</span>
			</div>
		);
	}
});

const AddLeague = React.createClass({
	getInitialState: function () {
		return {
			url: '',
			message: '',
			displayResult: false,
			leageueId: '',
			leagueName: ''
		};
	},
	createLeague: function () {
		this.setState({ message: '' });
		const urlSections = this.state.url.split('?');
		let parameterString = '';
		if (urlSections.length <= 1) {
			this.setState({ message: 'This URL is invalid, try another one!' });
		} else {
			parameterString = urlSections[1];

			const parsed = QueryString.parse(parameterString);
			if (!parsed.leagueId || !parsed.seasonId) {
				// invalid url
				console.log('do prevent here');
				this.setState({ message: 'This URL is invalid, try another one!' });
			} else {
				$.ajax({
					type: 'POST',
					url: '/football/tasks/createNewLeague',
					data: { espnId: parsed.leagueId, seasonId: parsed.seasonId },
					dataType: 'json',
					cache: false,
					success: function (data) {
						console.log(JSON.stringify(data));
						// if successfully logged in, open dashboard, else redirect to login
						if (data.execSuccess === false) {
							console.log('error could not add league');
							if (data.code === 'ERR_DUPLICATE_ESPN_ID') {
								this.setState({ message: 'The league already exists!' });
							} else if (data.code === 'ERR_PRIVATE_NOT_EXIST') {
								this.setState({ message: 'Sorry, the league is privated or does not exist! Ask your league manager to make your league public!' });
							} else if (data.code === 'ERR_INV_LEAGUE_TYPE') {
								this.setState({ message: 'Sorry, addy.ai currently only works with ESPN standard H2H point leagues.' });
							} else {
								this.setState({ message: 'Some strange error happened, try again in a bit!' });
							}
							this.setState({ displayResult: false });
							// could not add league
							// return message saying if wrong type or league is privated or does not exist
						} else {
							console.log('successfully added');
							const leagueId = data.data;

							this.setState({ displayResult: true, leagueId: leagueId });
							// place option for the league to show up below
							
						}
						
					}.bind(this),
					error: function (status, err) {
						console.error(status, err.toString());
						this.setState({ message: 'Hm, looks like the servers are down. Try again in a bit!' });
						// print network error warning
					}.bind(this)
				});
			}
		}
		
	},

	updateUrl: function (e) {
		this.setState({ url: e.target.value });
	},

	render: function () {
		let resultComponent;
		if (this.state.displayResult) {
			alert('display thing here');
			resultComponent = <LeagueNode leagueId={this.state.leagueId} leagueName="TODO: add league name" />;
		}
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
				<span>
					<Button
						bsStyle="primary"
						onClick={this.createLeague}
					>
						Search
					</Button>
					<span className="warning">
						{this.state.message}
					</span>
				</span>
				{resultComponent}

			</div>
		);
	}
});



module.exports = {
	LeagueContainer: LeagueContainer,
};