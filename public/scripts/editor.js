/* Wilbert Lam
05/16/2016
editor.js

Contains components for the editor

*/

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import ReactQuill from 'react-quill';

const Editor = React.createClass({
	getInitialState: function () {
		return { text: '' };
	},
	onTextChange: function (value) {
		this.setState({ text: value });
	},
	render: function () {
		return (
			<div>
				<Button
					authorId="1"
					author="Wilbert Lam"
					title="Dae Ho Goes Buck Wild"
					body={this.state.text}
					url="/news/saveArticle"
				/>
				<ReactQuill
					theme="snow"
					value={this.state.text}
					onChange={this.onTextChange}
				/>
				<Button
					authorId="1"
					author="Wilbert Lam"
					title="Dae Ho Goes Buck Wild"
					body={this.state.text}
					url="/news/saveArticle"
				/>
			</div>
		);
	}
});

const Button = React.createClass({
	propTypes: {
		text: React.PropTypes.string,
		url: React.PropTypes.string
	},
	save: function () {
		// ajax call to update the articles
		$.ajax({
			url: this.props.url,
			method: 'POST',
			dataType: 'JSON',
			data: {
				author_id: this.props.authorId,
				author: this.props.author,
				title: this.props.title,
				body: this.props.body,
			},
			success: function (data) {
				console.log(data.data);
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this),
		});
	},
	render: function () {
		return (
			<button className="pure-button" onClick={this.save} >Save</button>
		);
	}
});

ReactDOM.render(
	<Editor />,
	document.getElementById('quillContainer')
);
