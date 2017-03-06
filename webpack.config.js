const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
//const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const argv = process.argv;
const outDir = './app/public/build/';
const srcDir = './app/public/app/';
const libPath = outDir + 'lib/';
const scriptPath = outDir + 'scripts/';

const viewDir = './app/views/';

var isDev = true;//process.env.NODE_ENV === 'development' ? true : false;
var afterfix = isDev ? '.js' : '.min.js';

console.log(process.env.NODE_ENV);

var plugins = [
    //new CommonsChunkPlugin('scripts/common' + afterfix, ['index', 'vender']),
    new ExtractTextPlugin('styles/[name].css'),
    // new DllReferencePlugin({
    //     context: __dirname,
    //     manifest: require(path.resolve(__dirname, libPath + 'manifest-react.json'))
    // }),
    // new DllReferencePlugin({
    //     context: __dirname,
    //     manifest: require(path.resolve(__dirname, libPath + 'manifest-lib.json'))
    // }),
    // new DefinePlugin({
    //     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    // }),
    new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, viewDir + 'index.html'),
        template: path.resolve(__dirname, srcDir + 'tpl/index.html')
    })/*,
    new BrowserSyncPlugin({  
        // browse to http://localhost:3000/ during development
        host: '0.0.0.0',
        port: 3456, //代理后访问的端口
        server: { baseDir: [outDir] }
        //proxy: 'localhost:8080',//要代理的端口
    }, {
        // prevent BrowserSync from reloading the page
        // and let Webpack Dev Server take care of this
        reload: true
    })*/
];

if (!isDev) {
    plugins.push(new UglifyJsPlugin({
        minimize: true
    }));
}


module.exports = {
    entry: {
        //'style': __dirname + '/app/styles/ui.less',
        'index': path.resolve(__dirname, srcDir + 'index.js')
    },
    output: {
        path: path.resolve(__dirname, outDir),
        filename: '[name]' + afterfix,
        sourceMapFilename: '[name].map'
    },
    // devServer: {
    //     contentBase: path.resolve(__dirname, outDir),
    //     inline: true
    // },
    //devtool: 'source-map',
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'stage-0']
            }
        }, 
        {
            test: /\.vue$/,
            loader: 'vue-loader'
        }/*,
        {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                //resolve-url-loader may be chained before sass-loader if necessary 
                use: ['css-loader', 'less-loader']
            })
        }*/, {
            test: /\.(png|jpg)$/,
            loader: 'url?limit=25000'
        }]
    },
    plugins: plugins
};