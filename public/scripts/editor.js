/* Wilbert Lam
05/16/2016
editor.js

Contains components for the editor

*/

import React from 'react';
import $ from 'jquery';
import ReactQuill from 'react-quill';

// turn on features for toolbar
const formats = [
	'bold',
	'italic',
	'strike',
	'underline',
	'color',
	'background',
	'image',
	'link',
	'bullet',
	'list',
	'align'
];

const Editor = React.createClass({
	getInitialState: function () {
		return {
			text: '',
			title: '',
			author: '',
			articleId: this.props.articleId
		};
	},
	componentDidMount: function () {
		$.ajax({
			url: '/news/returnArticleById?articleId=' + this.state.articleId,
			dataType: 'json',
			cache: false,
			success: function (data) {
				// console.log('data:' + JSON.stringify(data.data[0]));
				const body = data.data[0];
				this.onTextChange(body.body);
				this.setState({ title: body.title });
				this.setState({ author: body.author });
			}.bind(this),
			error: function (xhr, status, err) {
				console.error(this.state.statCategory, status, err.toString());
			}.bind(this)
		});
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
					articleId={this.state.articleId}
					author={this.state.author}
					title={this.state.title}
					body={this.state.text}
					text="Save"
					type="btn btn-primary"
					url="/news/saveArticle"
				/>
				<Button
					articleId={this.state.articleId}
					authorId="1"
					author={this.state.author}
					title={this.state.title}
					body={this.state.text}
					text="Publish"
					type="btn btn-success"
					url="/news/publishArticle"
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
					styles="false"
					formats={formats}
					value={this.state.text}
					onChange={this.onTextChange}
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
		articleId: React.PropTypes.number,
		author: React.PropTypes.string,
		title: React.PropTypes.string
	},
	save: function () {
		// ajax call to update the articles
		console.log('ID THING: ' + this.props.articleId);
		$.ajax({
			url: this.props.url,
			method: 'POST',
			dataType: 'JSON',
			data: {
				author_id: this.props.authorId,
				article_id: this.props.articleId,
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
			<button className={this.props.type} onClick={this.save}>{this.props.text}</button>
		);
	}
});

module.exports = {
	Editor: Editor
};
