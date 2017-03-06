const webpack = require('webpack');
const path = require('path');

const vendors = ['react', 'react-immutable-render-mixin', 'react-dom', 'react/lib/ReactCSSTransitionGroup', 'react-router','redux', 'redux-thunk', 'react-redux'];
const exportPath = './build/lib';

module.exports = {
	output: {
		path: path.resolve( __dirname, exportPath),
		filename: '[name].js',
		library: '[name]'
	},
	entry: {
		"reactRel": vendors,
	},
	plugins: [
		new webpack.DllPlugin({
			path: path.resolve( __dirname, exportPath + '/manifest-react.json'),
			name: '[name]',
			context: __dirname
		})
	],
};