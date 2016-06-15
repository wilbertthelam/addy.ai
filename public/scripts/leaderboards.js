/* Wilbert Lam
05/06/2016
leaderboard.js

Contains components for the leaderboards

*/

import React from 'react';
import $ from 'jquery';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

//--------------------------
// PowerRankingsTeamsBox information
//--------------------------

const PRTeamListBox = React.createClass({
	getInitialState: function () {
		return { data: [] };
	},
	componentDidMount: function () {
		this.loadTeamsFromServer();
		// setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	loadTeamsFromServer: function () {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(data.data);
				this.setState({ data: data.data });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this),
		});
	},
	render: function () {
		return (
			<div className="table-responsive-vertical shadow-z-1">
				<PRTeamList data={this.state.data} />
			</div>
		);
	},
});

const PRTeamList = React.createClass({
	render: function () {
		let i = 0;
		const teamNodes = this.props.data.map(function (data) {
			i++;
			return (
				<PRTeam
					teamName={data.team_name}
					ownerName={data.owner_name}
					prScore={data.pr_score}
					id={data.team_id}
					key={i}
				/>
			);
		});

		return (
			<table className="table table-hover table-mc-amber">
				<thead>
					<tr>
						<th>PR Rating</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{teamNodes}
				</tbody>
			</table>
		);
	},
});

const PRTeam = React.createClass({
	render: function () {
		return (
			<tr className="team">
				<td data-title="PR Rating">
					{this.props.prScore}
				</td>
				<td data-title="Owner">
					{this.props.ownerName}
				</td>
				<td data-title="Team">
					{this.props.teamName}
				</td>
			</tr>
		);
	},
});

//--------------------------
// TeamStatsBox information
//--------------------------

function sortGenerator(statCategory) {
	return function (a, b) {
		if (statCategory === 'ERA' || statCategory === 'WHIP') {
			return a[statCategory] - b[statCategory];
		}
		return b[statCategory] - a[statCategory];
	};
}

// Overarching TeamBattersStat Container
const TeamStatsBox = React.createClass({
	propTypes: {
		url: React.PropTypes.string,
		week: React.PropTypes.number,
		displayField: React.PropTypes.string,
		categories: React.PropTypes.array
	},
	getInitialState: function () {
		return (
			{
				data: [],
				statCategory: this.props.categories[0]
			}
		);
	},
	componentDidMount: function () {
		this.getStats(this.props.week);
		// setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	componentWillReceiveProps: function (nextProps) {
		this.getStats(nextProps.week);
	},
	getStats: function (week) {
		$.ajax({
			url: this.props.url + '?week=' + week,
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(data.data);
				this.setState({ data: data.data }, function () {
					this.updateStats();
				});
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.state.statCategory, status, err.toString());
			}.bind(this)
		});
	},
	handleChildButtonClick: function (stat) {
		this.setState({ statCategory: stat }, function () {
			this.updateStats();
		});
	},
	updateStats: function () {
		const tempData = this.state.data;
		const statCategory = this.state.statCategory;
		tempData.sort(sortGenerator(statCategory));
		this.setState({ data: tempData });
	},
	render: function () {
		return (
			<div>
				<ButtonsList
					clickFunc={this.handleChildButtonClick}
					statCategories={this.props.categories}
					activeStat={this.state.statCategory}
				/>
				<div className="table-responsive-vertical shadow-z-1">
					<StatBox
						statData={this.state.data}
						stat={this.state.statCategory}
						displayField={this.props.displayField}
						tooltipKey={this.props.tooltipKey}
					/>
				</div>
			</div>
		);
	}
});

// List of all buttons together
const ButtonsList = React.createClass({
	render: function () {
		const that = this;
		let i = 0;
		const buttonNodes = this.props.statCategories.map(function (stat) {
			i++;
			let activeStatus = '';
			if (stat === that.props.activeStat) {
				// console.log(stat + 'set as active');
				activeStatus = 'active';
			}
			return (
				<Button
					key={i}
					statCategory={stat}
					activeStatus={activeStatus}
					clickFunc={that.props.clickFunc}
				/>
			);
		});

		return (
			<span>
				<div className="btn-group" role="group" aria-label="Basic example">
					{buttonNodes}
				</div>
			</span>
		);
	}
});

// Individual buttons
const Button = React.createClass({
	handleClick: function () {
		const statLookup = this.props.statCategory;
		// console.log(statLookup);
		this.props.clickFunc(statLookup);
	},
	render: function () {
		return (
			<button
				onClick={this.handleClick}
				type="button"
				className={'btn btn-primary ' + this.props.activeStatus}
			>
				{this.props.statCategory}
			</button>
		);
	}
});

// Individual statline
const Stat = React.createClass({
	render: function () {
		return (
			<OverlayTrigger placement="right" overlay={(<Tooltip>{this.props.tooltipValue}</Tooltip>)}>
				<tr>
					<td className="statValue" data-title={this.props.statCategory}>{this.props.statValue}</td>
					<td data-title="">{this.props.stats[this.props.displayField]}</td>
				</tr>
			</OverlayTrigger>
		);
	}
});


// Stat header value
const StatsHeader = React.createClass({
	render: function () {
		return (
			<tr>
				<th>{this.props.stat}</th>
				<th></th>
			</tr>
		);
	}
});

// List of all the statlines
const StatsList = React.createClass({
	render: function () {
		const statCategory = this.props.stat;
		const displayField = this.props.displayField;
		const tooltipKey = this.props.tooltipKey;
		// console.log(JSON.stringify(this.props.statData));
		let i = 0;
		const cutoff = 1.0;
		const statNodes = this.props.statData.map(function (statline) {
			i++;
			if (i <= 15) {
				if (statline.IP < cutoff && (statline.player_position === 'SP' || statline.player_position === 'RP') && (displayField === 'player_name')) {
					i--;
				}
				else {
					if ((statCategory === 'WHIP' || statCategory === 'ERA') && (statline.player_position !== 'SP' && statline.player_position !== 'RP') && displayField === 'player_name') {
						i--;
					} else {
						console.log('entered positive zine')
						return (
							<Stat
								key={i}
								displayField={displayField}
								stats={statline}
								statCategory={statCategory}
								id={statline.team_id}
								teamName={statline.team_name}
								owner={statline.owner_name}
								tooltipValue={statline[tooltipKey]}
								statValue={statline[statCategory]}
							/>
						);
					}
				}
			}
		});
		return (
			<tbody>
				{statNodes}
			</tbody>
		);
	}
});

// Container for StatHeader and StatsList
const StatBox = React.createClass({
	render: function () {
		return (
			<table className="table table-hover table-mc-amber">
				<StatsList
					statData={this.props.statData}
					stat={this.props.stat}
					displayField={this.props.displayField}
					tooltipKey={this.props.tooltipKey}
				/>
			</table>
		);
	},
});

const TopPlayersBox = React.createClass({
	render: function () {
		return (
			<div className="table-responsive-vertical shadow-z-1 col-md-12 topPlayerBox">
				<TopPlayersDisplay
					baseUrl={this.props.baseUrl}
					position={this.props.position}
					categories={this.props.categories}
					week={this.props.week}
				/>
			</div>
		);
	},
});

// const OptionsSelect = React.createClass({
// 	render: function () {
// 		return (
// 			<div>
// 				1B 2B SS 3B
// 			</div>
// 		);
// 	},
// });

// Container for top players
const TopPlayersDisplay = React.createClass({
	getInitialState: function () {
		return ({
			data: []
		});
	},
	componentDidMount: function () {
		this.getPlayerData(this.props.week);
	},
	componentWillReceiveProps: function (nextProps) {
		this.getPlayerData(nextProps.week);
	},
	getPlayerData: function (week) {
		// console.log("current week= " + week);
		$.ajax({
			// add in leagueId, seasonId
			url: this.props.baseUrl + '?position=' + this.props.position + '&week=' + week,
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log(JSON.stringify(data));
				this.setState({ data: data.data });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.props.baseUrl, status, err.toString());
			}.bind(this),
		});
	},
	render: function () {
		return (
			<PlayerInfo
				data={this.state.data}
				categories={this.props.categories}
			/>
		);
	}
});

const Picture = React.createClass({
	// componentDidMount: function () {
	// 	getPicture(this.props.pictureUrl);
	// },
	getPicture: function () {
		// ajax get here
	},
	render: function () {
		return (
			<img src="http://newton.physics.uiowa.edu/~sbaalrud/empty_profile.gif" alt="profilePic" height="60" width="60" />
		);
	}
});

const PlayerInfo = React.createClass({
	propTypes: {
		data: React.PropTypes.array
	},
	render: function () {
		let playerNodes = [];
		if (this.props.data.length > 0) {
			let i = 1;
			playerNodes = this.props.data.splice(1, 4).map(function (player) {
				i++;
				return (
					<PlayerInfoList
						key={player.player_id}
						index={i}
						playerName={player.player_name}
						teamName={player.team_name}
						ownerName={player.owner_name}
					/>
				);
			});
		}
		return (
			<div className="row">
				<PlayerFirstNode
					data={this.props.data[0]}
					categories={this.props.categories}
				/>
			</div>
		);
	}
});

const PlayerInfoList = React.createClass({
	render: function () {
		return (
			<tr>
				<td className="bold">
					{this.props.index}
				</td>
				<td>
					{this.props.playerName}
					<br />
					{this.props.teamName}
				</td>
			</tr>
		);
	}
});

const PlayerFirstNode = React.createClass({
	render: function () {
		if (this.props.data) {
			return (
				<div className="row">
					<div className="col-md-3">
						<Picture />
					</div>
					<div className="col-md-9">
						<div>
							<span className="bold">{this.props.data.player_name}</span>
							<span>, {this.props.data.player_position}</span>
						</div>
						<div>{this.props.data.team_name}</div>
					</div>
					<div className="col-md-12">
						<PlayerStatLine
							data={this.props.data}
							categories={this.props.categories}
						/>
					</div>
				</div>
			);
		}
		return null;
	}
});

const PlayerStatLine = React.createClass({
	render: function () {
		const headers = this.props.categories.map(function (category) {
			return (
				<th key={category}>
					{category}
				</th>
			);
		});

		const that = this;
		const stats = this.props.categories.map(function (category) {
			return (
				<td key={category}>
					{that.props.data[category]}
				</td>
			);
		});

		return (
			<table className="table table-hover table-mc-amber">
				<thead>
					<tr>
						{headers}
					</tr>
				</thead>
				<tbody>
					<tr>
						{stats}
					</tr>
				</tbody>
			</table>
		);
	}
});

module.exports = {
	TeamStatsBox: TeamStatsBox,
	PRTeamListBox: PRTeamListBox,
	TopPlayersBox: TopPlayersBox
};



