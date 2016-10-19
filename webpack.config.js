const webpack = require('webpack');
const path = require('path');

const PATHS = {
	app: path.join(__dirname, 'public/scripts/index.js'),
	football: path.join(__dirname, 'public/scripts/football.js'),
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
		football: [
			PATHS.football,
			PATHS.hotload
		],
	},
	output: {
		path: PATHS.build,
		publicPath: '/build',
		filename: '[name]_bundle.js'
	},
	devtool: 'cheap-module-source-map',
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
			// This has effect on the react lib size
				NODE_ENV: JSON.stringify('production'),
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
		    compress: {
		        warnings: false,
		        drop_console: true
		    },
		    comments: false,
		    sourceMap: false
		})
	],
	module: {
		noParse: [
			path.resolve('node_modules/react-quill/node_modules/quill/dist/quill.js'),
			path.resolve('node_modules/quill/dist/quill.js')
		],
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
