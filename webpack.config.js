var webpack = require('webpack');
const path = require('path');

const PATHS = {
	app: path.join(__dirname, 'public/scripts/index.js'),
	build: path.join(__dirname, '/build')
};

module.exports = {
	context: __dirname,
	entry: [
		PATHS.app, path.join(__dirname, 'public/scripts/leaderboards.js'), 'webpack-hot-middleware/client'
	],
	output: {
		path: PATHS.build,
		publicPath: '/build',
		filename: 'bundle.js'
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