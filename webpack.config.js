const webpack = require('webpack');
const path = require('path');

const PATHS = {
	app: path.join(__dirname, 'public/scripts/index.js'),
	leaderboards: path.join(__dirname, 'public/scripts/leaderboards.js'),
	editor: path.join(__dirname, 'public/scripts/editor.js'),
	news: path.join(__dirname, 'public/scripts/news.js'),
	hotload: 'webpack-hot-middleware/client',
	build: path.join(__dirname, '/build')
};

module.exports = {
	context: __dirname,
	entry: {
		index: [
			PATHS.app,
			PATHS.hotload
		],
		leaderboards: [
			PATHS.leaderboards,
			PATHS.hotload
		],
		editor: [
			PATHS.editor,
			PATHS.hotload
		],
		news: [
			PATHS.news,
			PATHS.hotload
		],
	},
	output: {
		path: PATHS.build,
		publicPath: '/build',
		filename: '[name]_bundle.js'
	},
	devtool: '#source-map',
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				include: [path.join(__dirname, 'public/scripts/')],
				loader: 'babel',
			}
		],
	}
};
