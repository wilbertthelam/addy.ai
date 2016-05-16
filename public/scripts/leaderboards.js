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

// Individual buttons
var Button = React.createClass({
	render: function() {
		return (
			<button className="pure-button">{this.props.statCategory}</button> 
		);
	}
});

// List of all buttons together
var ButtonsList = React.createClass({
	render: function() {
		var buttonNodes = this.props.statCategories.map(function(stat) {
			return (
				<Button statCategory={stat} />
			);
		});

		return (
			<span>
				{buttonNodes}
			</span>
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
				<td>{this.props.stat}</td>
				<td></td>
			</tr>
		);
	}
});

// List of all the statlines
var StatsList = React.createClass({
	getStats: function() {
		$.ajax({
			url: '/stats?stat=' + this.props.stat,
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.log(data.data);
				this.setState({data: data.data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('/stats?stat=' + this.props.stat, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return{ data: []};
	},
	componentDidMount: function() {
		this.getStats();
		//setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	render: function() {
		var statCategory = this.props.stat;
		var statNodes = this.state.data.map(function(statline) {
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
				<StatsList stat={this.props.stat} />
			</table>
		);
	}
});

// Overarching TeamStat Container
var TeamStatsBox = React.createClass({
	getInitialState: function() {
		return (
			{ statCategories: ['R', 'HR', 'RBI', 'SB', 'OBP'] }
		);
	},
	render: function() {
		return (
			<div>
				<ButtonsList statCategories={this.state.statCategories} />
				<StatBox stat={this.state.statCategories[1]} />
			</div>
		);
	}
});

ReactDOM.render(
	<TeamStatsBox />,
	document.getElementById('teamStatsBox')
);



// Home Run Leaderboard Component
// var StatsListBox = React.createClass({

// });

// var OffenseButton = React.createClass({
// 	render: function() {
// 		return (
// 	        <button className="pure-button" onClick={this.props.onClick}>{this.props.text}</button> 
// 	    );
// 	}
// });

// var HomeRunsList = React.createClass({
// 	render: function() {
// 		var homeRunNodes = this.props.data.map(function(data) {
// 			return (
// 				<HomeRuns teamName={data.team_name} homeRuns={data.HR} key={data.team_id}>
// 				</HomeRuns>
// 			);
// 		});

// 		return (
// 			<table className="pure-table pure-table-horizontal">
// 				<thead>
// 			        <tr>
// 			            <th>HR</th>
// 			            <th></th>
// 			        </tr>
// 			    </thead>
// 				<tbody>
// 					{homeRunNodes}
// 				</tbody>
// 			</table>
// 		);
// 	}
// });

// var HomeRuns = React.createClass({
// 	render: function() {
// 		return (
// 			<tr className="homeruns">
// 				<td>
// 					{this.props.homeRuns}
// 				</td>
// 				<td>
// 					{this.props.teamName}
// 				</td>
// 			</tr>
// 		);
// 	}
// });


// ReactDOM.render(
// 	<StatsListBox url="/stats?stat=HR" pollInterval={5000} />,
// 	document.getElementById('statsLeaders')
// );
