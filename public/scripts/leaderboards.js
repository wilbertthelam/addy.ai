/* Wilbert Lam
05/06/2016
leaderboard.js

Contains components for the leaderboards

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
// import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';

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
		const teamNodes = this.props.data.map(function (data) {
			return (
				<PRTeam
					teamName={data.team_name}
					ownerName={data.owner_name}
					prScore={data.pr_score}
					key={data.team_id}
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

ReactDOM.render(
	<PRTeamListBox url="/powerRankings" pollInterval={5000} />,
	document.getElementById('teamListContent'));


//--------------------------
// TeamStatsBox information
//--------------------------

function sortGenerator(statCategory) {
	return function (a, b) {
		return b[statCategory] - a[statCategory];
	};
}

// Overarching TeamBattersStat Container
const TeamStatsBox = React.createClass({
	getInitialState: function () {
		return (
			{
				data: [],
				statCategory: this.props.categories[0]
			}
		);
	},
	componentDidMount: function () {
		this.getStats();
		// setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	getStats: function () {
		$.ajax({
			url: this.props.url,
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
				/>
				<div className="table-responsive-vertical shadow-z-1">
					<StatBox
						statData={this.state.data}
						stat={this.state.statCategory}
						displayField={this.props.displayField}
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
		const buttonNodes = this.props.statCategories.map(function (stat) {
			return (
				<Button
					key={stat}
					statCategory={stat}
					clickFunc={that.props.clickFunc}
				/>
			);
		});

		return (
			<span>
				{buttonNodes}
			</span>
		);
	}
});

// Individual buttons
const Button = React.createClass({
	handleClick: function () {
		const statLookup = this.props.statCategory;
		console.log(statLookup);
		this.props.clickFunc(statLookup);
	},
	render: function () {
		return (
			<button onClick={this.handleClick} className="btn btn-primary">
				{this.props.statCategory}
			</button>
		);
	}
});

// Individual statline
const Stat = React.createClass({
	render: function () {
		return (
			<tr>
				<td data-title={this.props.statCategory}>{this.props.statValue}</td>
				<td data-title="">{this.props.stats[this.props.displayField]}</td>
			</tr>
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
		console.log(JSON.stringify(this.props.statData));
		const statNodes = this.props.statData.map(function (statline) {
			return (
				<Stat
					displayField={displayField}
					stats={statline}
					statCategory={statCategory}
					key={statline.team_id}
					teamName={statline.team_name}
					owner={statline.owner_name}
					statValue={statline[statCategory]}
				/>
			);
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
				<thead>
					<StatsHeader
						stat={this.props.stat}
					/>
				</thead>
				<StatsList
					statData={this.props.statData}
					stat={this.props.stat}
					displayField={this.props.displayField}
				/>
			</table>
		);
	},
});

ReactDOM.render(
	<TeamStatsBox
		url="/stats"
		categories={['R', 'HR', 'RBI', 'SB', 'OBP']}
		displayField="team_name"
	/>,
	document.getElementById('teamBattersStatsBox')
);

ReactDOM.render(
	<TeamStatsBox
		url="/stats"
		categories={['K', 'W', 'SV', 'ERA', 'WHIP']}
		displayField="team_name"
	/>,
	document.getElementById('teamPitchersStatsBox')
);

ReactDOM.render(
	<TeamStatsBox
		url="/weeklyPlayerStats"
		categories={['R', 'HR', 'RBI', 'SB', 'OBP']}
		displayField="player_name"
	/>,
	document.getElementById('weeklyBattersStatsBox')
);

ReactDOM.render(
	<TeamStatsBox
		url="/weeklyPlayerStats"
		categories={['K', 'W', 'SV', 'ERA', 'WHIP']}
		displayField="player_name"
	/>,
	document.getElementById('weeklyPitchersStatsBox')
);



