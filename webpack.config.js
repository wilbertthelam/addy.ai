const webpack = require('webpack');
const path = require('path');

const PATHS = {
	app: path.join(__dirname, 'public/scripts/index.js'),
	leaderboards: path.join(__dirname, 'public/scripts/leaderboards.js'),
	editor: path.join(__dirname, 'public/scripts/editor.js'),
	news: path.join(__dirname, 'public/scripts/news.js'),
	scoreticker: path.join(__dirname, 'public/scripts/scoreticker.js'),
	hotload: 'webpack-hot-middleware/client',
	build: path.join(__dirname, '/public/build')
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
		scoreticker: [
			PATHS.scoreticker,
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
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
			// This has effect on the react lib size
				'NODE_ENV': JSON.stringify('production'),
			}
		}),
	],
	module: {
		noParse: path.resolve('node_modules/react-quill/node_modules/quill/dist/quill.js'),
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
