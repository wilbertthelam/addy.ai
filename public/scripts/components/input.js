/* Wilbert Lam
10/22/2016
input.js

Contains shared component for input form

*/

import React from 'react';

const Input = React.createClass({
	getInitialState: function () {
		return {
			type: '',
			name: '',
			placeholder: '',
			className: '',
			value: '',
		};
	},
	componentDidMount: function () {
		this.setState({
			type: this.props.type,
			name: this.props.name,
			placeholder: this.props.placeholder,
			className: this.props.className,
			value: this.props.value,
		});
	},
	_updateValue: function (e) {
		this.setState({
			value: e.target.value
		}, this.props.fieldChange(this.state.name, e.target.value));
	},
	render: function () {
		return (
			<input
				type={this.state.type}
				name={this.state.name}
				placeholder={this.state.placeholder}
				className={this.state.className}
				value={this.state.value}
				onChange={this._updateValue}
			/>
		);
	}
});

module.exports = {
	Input: Input
};
