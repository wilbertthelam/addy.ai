/* Wilbert Lam
05/06/2016
leaderboard.js

Contains components for the leaderboards

*/

var TeamListBox = React.createClass({
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
				<TeamList data={this.state.data} />
			</div>
		);
	}
});

var TeamList = React.createClass({
	render: function() {
		var teamNodes = this.props.data.map(function(data) {
			return (
				<Team teamName={data.team_name} ownerName={data.owner_name} key={data.team_id}>
				</Team>
			);
		});

		return (
			<table className="pure-table pure-table-horizontal">
				<thead>
			        <tr>
			            <th>Team</th>
			            <th>Owner</th>
			        </tr>
			    </thead>
				<tbody>
					{teamNodes}
				</tbody>
			</table>
		);
	}
});

var Team = React.createClass({
	render: function() {
		return (
			<tr className="team">
				<td>
					{this.props.teamName}
				</td>
				<td>
					{this.props.ownerName}
				</td>
			</tr>
		);
	}
});

ReactDOM.render(
	<TeamListBox url="/teams" pollInterval={5000} />,
	document.getElementById('teamListContent'));



// Home Run Leaderboard Component
var StatsListBox = React.createClass({
	loadStatsFromServer: function() {
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
		return { 
			data: [], 
			buttonData: [
				{buttonText: 'R', buttonValue: 'R', buttonNumber: 1},
				{buttonText: 'HR', buttonValue: 'HR', buttonNumber: 2},
				{buttonText: 'RBI', buttonValue: 'RBI', buttonNumber: 3},
				{buttonText: 'SB', buttonValue: 'SB', buttonNumber: 4},
				{buttonText: 'OBP', buttonValue: 'OBP', buttonNumber: 5}
			]
		};
	},
	componentDidMount: function() {
		this.loadStatsFromServer();
		setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	selectR: function() {
		alert("HI");
		return (
			<div className="statsListBox">
				<OffenseButton />
				<RunsList data={this.state.data} />
			</div>);
	},
	selectHR: function() {
		return (
			<div className="statsListBox">
				<OffenseButton />
				<HomeRunsList data={this.state.data} />
			</div>);
	},
	render: function() {
		var childrens = this.state.buttonData.map(function(childData,childIndex) {
        	return <OffenseButton onClick={this.handleChildClick.bind(null, childData)} text={childData.buttonText}/>;
    	}.bind(this));
		return (
			<div className="statsListBox">
				{childrens}
				<RunsList data={this.state.data} />
				<HomeRunsList data={this.state.data} />
			</div>
		);
	},

	handleChildClick: function(childData, event) {
		return (
			<div className="statsListBox">
				HI
			</div>
		);
	}
});

var OffenseButton = React.createClass({
	render: function() {
		return (
	        <button className="pure-button" onClick={this.props.onClick}>{this.props.text}</button> 
	    );
	}
});

var HomeRunsList = React.createClass({
	render: function() {
		var homeRunNodes = this.props.data.map(function(data) {
			return (
				<HomeRuns teamName={data.team_name} homeRuns={data.HR} key={data.team_id}>
				</HomeRuns>
			);
		});

		return (
			<table className="pure-table pure-table-horizontal">
				<thead>
			        <tr>
			            <th>HR</th>
			            <th>Team</th>
			        </tr>
			    </thead>
				<tbody>
					{homeRunNodes}
				</tbody>
			</table>
		);
	}
});

var HomeRuns = React.createClass({
	render: function() {
		return (
			<tr className="homeruns">
				<td>
					{this.props.homeRuns}
				</td>
				<td>
					{this.props.teamName}
				</td>
			</tr>
		);
	}
});

var RunsList = React.createClass({
	render: function() {
		var runNodes = this.props.data.map(function(data) {
			return (
				<Runs teamName={data.team_name} runs={data.R} key={data.team_id}>
				</Runs>
			);
		});

		return (
			<table className="pure-table pure-table-horizontal">
				<thead>
			        <tr>
			            <th>R</th>
			            <th>Team</th>
			        </tr>
			    </thead>
				<tbody>
					{runNodes}
				</tbody>
			</table>
		);
	}
});

var Runs = React.createClass({
	render: function() {
		return (
			<tr className="runs">
				<td>
					{this.props.runs}
				</td>
				<td>
					{this.props.teamName}
				</td>
			</tr>
		);
	}
});

ReactDOM.render(
	<StatsListBox url="/stats" pollInterval={5000} />,
	document.getElementById('statsLeaders'));

// RBI Leaderboard Component
var RBILeaders = React.createClass({
	render: function() {
		return (
			<div className="rbiBoard">
				This is the RBI leaderboard.
			</div>
		);
	}
});