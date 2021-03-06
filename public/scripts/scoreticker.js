/* Wilbert Lam
06/07/2016
scoreticker.js

Contains components for the score ticker

*/

import React from 'react';
import $ from 'jquery';

//--------------------------
// ScoreTicker information
//--------------------------

const ScoreTicker = React.createClass({
	getInitialState: function () {
		return { data: [] };
	},
	componentDidMount: function () {
		this.getScores();
		// setInterval(this.loadTeamsFromServer, this.props.pollInterval);
	},
	getScores: function () {
		$.ajax({
			url: '/scoreboard',
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({ data: data.data });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error('scoreboard error', status, err.toString());
			},
		});
	},
	render: function () {
		let i = -1;
		const scoreNodes = this.state.data.map(function (score) {
			i++;
			return (
				<ScoreNode
					key={i}
					aTeamId={score.teamId_a}
					bTeamId={score.teamId_b}
					aTeamName={score.teamName_a}
					bTeamName={score.teamName_b}
					aResult={score.result_a}
					bResult={score.result_b}
					tieResult={score.result_tie}
					aLeader={(score.result_a > score.result_b) ? 'bold' : ''}
					bLeader={(score.result_b > score.result_a) ? 'bold' : ''}
				/>
			);
		});

		return (
			<ul className="pure-menu-list">
				{scoreNodes}
			</ul>
		);
	},
});

const ScoreNode = React.createClass({
	goToESPNScores: function () {
		window.location.href = 'http://games.espn.go.com/flb/scoreboard?leagueId=44067&seasonId=2016';
	},
	render: function () {
		return (
			<li className="pure-menu-item scoreNode" onClick={this.goToESPNScores}>
				<div className={this.props.aLeader}>
					<span className="score">{this.props.aResult} </span>
					<span>{this.props.aTeamName} </span>
				</div>
				<div className={this.props.bLeader}>
					<span className="score">{this.props.bResult} </span>
					<span>{this.props.bTeamName} </span>
				</div>
			</li>
		);
	}
});


module.exports = {
	ScoreTicker: ScoreTicker
};
