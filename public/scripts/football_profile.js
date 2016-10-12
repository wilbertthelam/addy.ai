/* Wilbert Lam
10/11/2016
football_profile.js

Contains components for the profile page

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Button, Nav, NavItem } from 'react-bootstrap';
import * as QueryString from 'query-string';
import Loading from 'react-loading';

const ProfileBox = React.createClass({
	render: function () {
		return (
			<div>
				<UserInfo
					url="/football/league/user"
				/>
			</div>
		);
	}
});

// Display box with basic user profile information
const UserInfo = React.createClass({
	getInitialState: function () {
		return {
			data: {
				first_name: '',
				last_name: '',
				email: '',
				userId: ''
			}
		};
	},
	componentDidMount: function () {
		this.getUserInfo(this.props.url);
	},
	getUserInfo: function (url) {
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				//console.log(JSON.stringify(data));
				this.setState({ data: data.data[0] });
			}.bind(this),
			error: function (status, err) {
				console.error(status, err.toString());
				this.context.router.push('/login');
			}.bind(this)
		});
	},
	capitalize: function (name) {
		return name.charAt(0).toUpperCase() + name.slice(1);
	},
	render: function () {
		return (
			<div>
				<p>Name: <span className="bold">{this.capitalize(this.state.data.first_name)} {this.capitalize(this.state.data.last_name)}</span></p>
				<p>Email: <span className="bold">{this.state.data.email} </span></p>
			</div>
		);
	}
});

module.exports = {
	ProfileBox: ProfileBox
};