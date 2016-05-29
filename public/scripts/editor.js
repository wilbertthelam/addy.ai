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
		return {
			text: '',
			title: '',
			author: ''
		};
	},
	onTextChange: function (value) {
		this.setState({ text: value });
	},
	onTitleChange: function (event) {
		this.setState({ title: event.target.value });
	},
	onAuthorChange: function (event) {
		this.setState({ author: event.target.value });
	},
	render: function () {
		return (
			<div>
				<Button
					authorId="1"
					author={this.state.author}
					title={this.state.title}
					body={this.state.text}
					url="/news/saveArticle"
				/>
				<div className="editorInfo">
					<form>
						<div className="form-group">
							<label htmlFor="articleTitle">Article title</label>
							<input
								type="text"
								className="form-control"
								id="articleTitle"
								placeholder="Article title"
								value={this.state.title}
								onChange={this.onTitleChange}
							/>
						</div>
						<div className="form-group">
							<label htmlFor="articleAuthor">Author</label>
							<input
								type="text"
								className="form-control"
								id="articleAuthor"
								placeholder="Author name"
								value={this.state.author}
								onChange={this.onAuthorChange}
							/>
						</div>
					</form>
				</div>
				<ReactQuill
					theme="snow"
					value={this.state.text}
					onChange={this.onTextChange}
				/>
				<Button
					authorId="1"
					author={this.state.author}
					title={this.state.title}
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
		url: React.PropTypes.string,
		authorId: React.PropTypes.number,
		author: React.PropTypes.string,
		title: React.PropTypes.string
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
			},
			error: function (xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this),
		});
	},
	render: function () {
		return (
			<button className="btn btn-primary" onClick={this.save} >Save</button>
		);
	}
});

ReactDOM.render(
	<Editor />,
	document.getElementById('quillContainer')
);
