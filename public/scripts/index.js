import * as Leaderboards from './leaderboards.js';
import * as News from './news.js';
import * as Editor from './editor.js';
import * as Scoreticker from './scoreticker.js';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { Router, Route, Link, browserHistory } from 'react-router';

console.log('Entry point');

const MainContainerPage = React.createClass({
	render: function () {
		return (
			<div className="innerMainContainer">
				<div>
					<div className="pure-menu pure-menu-horizontal fixedBannerContainer">
						<div id="menuContainer">
							<ul className="pure-menu-list">
								
								<li className="pure-menu-item">
									<Link to="/" className="pure-menu-link">Home</Link>
								</li>
								<li className="pure-menu-item">
									<Link to="/news" className="pure-menu-link">News</Link>
								</li>
								<li className="pure-menu-item">
									<a href="/createEditor" className="pure-menu-link">Editor</a>
								</li>
								<li className="pure-menu-item">
									<a href="#" className="pure-menu-link">Contact</a>
								</li>
							</ul>

							<Scoreticker.ScoreTicker />
						</div>
					</div>
				</div>

				{this.props.children}
			</div>
		);
	}
});

const LeaderboardPage = React.createClass({
	getInitialState: function () {
		return (
			{
				week: null
			}
		);
	},
	componentWillMount: function () {
		this.getCurrentWeek();
	},
	getCurrentWeek: function () {
		$.ajax({
			url: '/currentWeek',
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({ week: data.data.week });
				this.menuWeeksGetter(data.data.week);
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.state.week, status, err.toString());
			}.bind(this)
		});
	},
	changeWeek: function (week) {
		// console.log('week changed to : ' + week);
		this.setState({ week: week });
	},
	menuWeeksGetter: function (currentWeek) {
		const weeks = [];
		// console.log('current week= ' + currentWeek);
		for (let i = currentWeek; i > 0; i--) {
			weeks.push(<MenuItem eventKey={i} key={i} onSelect={this.changeWeek}>Week {i}</MenuItem>);
		}
		// console.log(weeks);
		this.setState({ menuWeeks: weeks });
	},
	render: function () {
		if (this.state.menuWeeks !== undefined) {
			const menuWeeksNodes = this.state.menuWeeks.map(function (menuItem) {
				return menuItem;
			});
			if (this.state.week !== null) {
				return (
					<div className="main">
						<div className="banner">
						</div>

						<div id="container">
							<div className="container">
								<div className="col-md-12 topRowOptions">
									<DropdownButton
										bsStyle="default"
										title={'Week ' + this.state.week}
										key="1"
									>
										{menuWeeksNodes}
									</DropdownButton>
								</div>

								<div className="col-md-6">
									<div className="col-md-6">
										<h2>Batting MVP</h2>
										<Leaderboards.TopPlayersBox
											baseUrl="/topPlayers"
											position="SS"
											categories={['R', 'HR', 'RBI', 'SB', 'OBP']}
											week={this.state.week}
										/>
									</div>

									<div className="col-md-6">
										<h2>Pitching MVP</h2>
										<Leaderboards.TopPlayersBox
											baseUrl="/topPlayers"
											position="SP"
											categories={['K', 'W', 'SV', 'ERA', 'WHIP']}
											week={this.state.week}
										/>
									</div>

									<div className="col-sm-6">
										<h2>Batting leaders</h2>
										<Leaderboards.TeamStatsBox
											url="/weeklyPlayerStats"
											week={this.state.week}
											categories={['R', 'HR', 'RBI', 'SB', 'OBP']}
											displayField="player_name"
										/>
									</div>

									<div className="col-sm-6">
										<h2>Pitching leaders</h2>
										<Leaderboards.TeamStatsBox
											url="/weeklyPlayerStats"
											week={this.state.week}
											categories={['K', 'W', 'SV', 'ERA', 'WHIP']}
											displayField="player_name"
										/>
									</div>
									
								</div>

								<div className="col-md-6">
									<div className="col-sm-6">
										<h2>Team batting</h2>
										<Leaderboards.TeamStatsBox
											url="/weeklyTeamStats"
											week={this.state.week}
											categories={['R', 'HR', 'RBI', 'SB', 'OBP']}
											displayField="team_name"
										/>
									</div>

									<div className="col-sm-6">
										<h2>Team pitching</h2>
										<Leaderboards.TeamStatsBox
											url="/weeklyTeamStats"
											week={this.state.week}
											categories={['K', 'W', 'SV', 'ERA', 'WHIP']}
											displayField="team_name"
										/>
									</div>

									<div className="col-sm-12">
										<h2>Power rankings</h2>
										<Leaderboards.PRTeamListBox url="/powerRankings" pollInterval={5000} />
									</div>

									<div className="col-sm-12">
										<h2>Admin tools</h2>
										<ul>
											<li><a href="/populatePastStats">populate past stats</a></li>
											<li><a href="/populateCurrentStats">populate current stats</a></li>
											<li><a href="/populateCurrentPlayerStats">populate current player stats</a></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			}
		}
		return (
			<div className="main" />
		);
	}
});

const NewsPage = React.createClass({
	render: function () {
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="container">
					<News.NewsContainer />
				</div>
			</div>
		);
	}
});

const EditorPage = React.createClass({
	render: function () {
		return (
			<div className="main">
				<div className="banner">
				</div>

				<div id="quillContainer">
					<Editor.Editor articleId={this.props.location.query.articleId} />
				</div>
			</div>
		);
	}
});

ReactDOM.render((
	<Router history={browserHistory}>
		<Route component={MainContainerPage}>
			<Route path="/" component={LeaderboardPage} />
			<Route path="/news" component={NewsPage} />
			<Route path="/editor" component={EditorPage} />
		</Route>
	</Router>
), document.getElementById('mainContainer'));
