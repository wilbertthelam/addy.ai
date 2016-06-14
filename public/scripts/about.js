/* Wilbert Lam
06/13/2016
about.js

Contains components for the about page

*/

import React from 'react';
import $ from 'jquery';

const AboutContainer = React.createClass({
	render: function () {
		return (
			<div className="container">
				<div className="col-md-4">
					<TeamCard
						name="Addison Wright"
						position="Executive editor"
						description="Wright, 22, aka Addy or Addi, is an avid fantasy sports guru who enjoys being forced to write like Wilbert."
						image="http://i.imgur.com/DaPiYWu.png"
					/>
				</div>

				<div className="col-md-4">
					<TeamCard
						name="Wilbert Lam"
						position="Technical director, League commisioner"
						description="Lam, 22, enjoys turning addy.ai into a global fantasy sports Skynet and beating other fantasy teams very badly."
						image="http://i.imgur.com/jJOAtOY.png"
					/>
				</div>

				<div className="col-md-4">
					<TeamCard
						name="David Yongmin Lee"
						position="Columnist"
						description="Lee, 23, abandoned his team and does not like baseball."
						image="http://i.imgur.com/PAXd5S4.png"
					/>
				</div>
			</div>
		);
	}
});

const TeamCard = React.createClass({
	render: function () {
		return (
			<div className="teamCard shadow-z-1">
				<h2>{this.props.name}</h2>
				<div className="bold">{this.props.position}</div>
				<img src={this.props.image} className="teamMemberPic img-thumbnail" />
				<p>
					{this.props.description}
				</p> 
			</div>
		);
	}
});

module.exports = {
	AboutContainer: AboutContainer
};