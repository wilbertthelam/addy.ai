/* Wilbert Lam
05/16/2016
editor.js

Contains components for the editor

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
var ReactQuill = require('react-quill');

var Editor = React.createClass({
	getInitialState: function() {
		return{ text: ''};
	},
	onTextChange: function(value) {
		this.setState({ text:value });
	},
	render: function() {
		return (
			<ReactQuill theme="snow" value={this.state.text} onChange={this.onTextChange} />
		);
	}
});

ReactDOM.render(
	<Editor />,
	document.getElementById('quillContainer'));