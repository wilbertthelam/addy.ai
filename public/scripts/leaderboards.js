/* Wilbert Lam
05/06/2016
leaderboard.js

Contains components for the leaderboards

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery'
//import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';

var PRTeamListBox = React.createClass({
	loadTeamsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.log(data.data);
				this.setState({data: data.data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return{ data: []};
	},
	componentDidMount: function() {
		this.loadTeamsFromServer();
		//setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div className="teamListBox">
				<PRTeamList data={this.state.data} />
			</div>
		);
	}
});

var PRTeamList = React.createClass({
	render: function() {
		var teamNodes = this.props.data.map(function(data) {
			return (
				<PRTeam teamName={data.team_name} ownerName={data.owner_name} prScore={data.pr_score} key={data.team_id}>
				</PRTeam>
			);
		});

		return (
			<table className="pure-table pure-table-horizontal">
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
	}
});

var PRTeam = React.createClass({
	render: function() {
		return (
			<tr className="team">
				<td>
					{this.props.prScore}
				</td>
				<td>
					{this.props.ownerName}
				</td>
				<td>
					{this.props.teamName}
				</td>
			</tr>
		);
	}
});

ReactDOM.render(
	<PRTeamListBox url="/powerRankings" pollInterval={5000} />,
	document.getElementById('teamListContent'));


//--------------------------
// TeamStatsBox information
//--------------------------

// Overarching TeamBattersStat Container
var TeamBattersStatsBox = React.createClass({
	getInitialState: function() {
		return (
			{ 
				data: [],
				statCategory: 'R'
			}
		);
	},
	getStats: function() {
		$.ajax({
			url: '/stats?stat=' + this.state.statCategory,
			dataType: 'json',
			cache: false,
			success: function(data) {
				//console.log(data.data);
				this.setState({data: data.data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/stats?stat=' + this.state.statCategory, status, err.toString());
			}.bind(this)
		});
	},
	handleChildButtonClick: function(stat) {
		this.setState({statCategory: stat}, function() {
			this.getStats();
		});
	},
	componentDidMount: function() {
		this.getStats();
		//setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div>
				<ButtonsList clickFunc={this.handleChildButtonClick} statCategories={['R', 'HR', 'RBI', 'SB', 'OBP']} />
				<StatBox statData={this.state.data} stat={this.state.statCategory} />
			</div>
		);
	}
});

// Overarching TeamBattersStat Container
var TeamPitchersStatsBox = React.createClass({
	getInitialState: function() {
		return (
			{ 
				data: [],
				statCategory: 'K'
			}
		);
	},
	getStats: function() {
		$.ajax({
			url: '/stats?stat=' + this.state.statCategory,
			dataType: 'json',
			cache: false,
			success: function(data) {
				//console.log(data.data);
				this.setState({data: data.data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/stats?stat=' + this.state.statCategory, status, err.toString());
			}.bind(this)
		});
	},
	handleChildButtonClick: function(stat) {
		this.setState({statCategory: stat}, function() {
			this.getStats();
		});
	},
	componentDidMount: function() {
		this.getStats();
		//setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	render: function() {
		return (
			<div>
				<ButtonsList clickFunc={this.handleChildButtonClick} statCategories={['W', 'K', 'SV', 'ERA', 'WHIP']} />
				<StatBox statData={this.state.data} stat={this.state.statCategory} />
			</div>
		);
	}
});

// List of all buttons together
var ButtonsList = React.createClass({
	render: function() {
		var that = this;
		var buttonNodes = this.props.statCategories.map(function(stat) {
			return (
				<Button key={stat} statCategory={stat} clickFunc={that.props.clickFunc}/>
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
var Button = React.createClass({
	handleClick: function() {
		var statLookup = this.props.statCategory;
		console.log(statLookup);
		this.props.clickFunc(statLookup);
	},
	render: function() {
		return (
			<button onClick={this.handleClick} className="pure-button">{this.props.statCategory}</button> 
		);
	}
});

// Individual statline
var Stat = React.createClass({
	render: function() {
		return (
			<tr>
				<td>{this.props.statValue}</td>
				<td>{this.props.teamName}</td>
			</tr>
		);
	}
});

// Stat header value
var StatsHeader = React.createClass({
	render: function() {
		return (
			<tr>
				<th>{this.props.stat}</th>
				<th></th>
			</tr>
		);
	}
});

// List of all the statlines
var StatsList = React.createClass({
	render: function() {
		var statCategory = this.props.stat;
		var statNodes = this.props.statData.map(function(statline) {
			return (
				<Stat key={statline.team_id} teamName={statline.team_name} owner={statline.owner_name} statValue={statline[statCategory]} />
			);
		})
		return (
			<tbody>
				{statNodes}
			</tbody>
		);
	}
});

// Container for StatHeader and StatsList
var StatBox = React.createClass({
	render: function() {
		return (
			<table className="pure-table pure-table-horizontal">
				<thead>
					<StatsHeader stat={this.props.stat} />
				</thead>
				<StatsList statData={this.props.statData} stat={this.props.stat}/>
			</table>
		);
	}
});

ReactDOM.render(
	<TeamBattersStatsBox />,
	document.getElementById('teamBattersStatsBox')
);

ReactDOM.render(
	<TeamPitchersStatsBox />,
	document.getElementById('teamPitchersStatsBox')
);

