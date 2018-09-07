const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const HtmlReloadPlugin = require('reload-html-webpack-plugin');
const auth = require('basic-auth');

module.exports = {
    entry: {
        app: './src/index.js',
        //upload: './src/upload.js',
        //vendor: ['jquery', 'alpaca', 'cytoscape', 'bootstrap'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        // hotUpdateChunkFilename: 'dist/hot-update.js',
        // hotUpdateMainFilename: 'dist/hot-update.json'
    },
    resolve: {
        alias: {
            'handlebars' : 'handlebars/dist/handlebars.js',
            'jquery': 'jquery/src/jquery',
            'cytoscape-cola': '../cy-co/cytoscape-cola.js',
        },
    },
    module: {
        rules: [
            //{
            //    test: path.resolve(__dirname, 'node_modules/webpack-dev-server/client'),
            //    use: 'null-loader'
            //},
            // {
            //     test: path.resolve(__dirname, 'node_modules/cytoscape-cola'),
            //     use: 'null-loader'
            // },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                minimize: false
                            }
                        },
                        { loader: 'less-loader',
                          options: {
                              sourceMap: true }
                        }
                    ]
                })
                // use: [{
                //     loader: 'style-loader' // creates style nodes from JS strings
                // }, {
                //     loader: 'css-loader' // translates CSS into CommonJS
                // }, {
                //     loader: 'less-loader' // compiles Less to CSS
                // }]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            minimize: true
                        }
                    }],
                })
            },
            {
                test: /\.(jpg|jpeg|gif|png|eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: 'assets/[name].[ext]'
                }
            },
            /*{
              test: /node_modules\/alpaca\/(alpaca).*\.js$/,
              loader: "imports-loader?this=>window"
              },
              {
              test: /node_modules\/(bootstrap-tokenfield)\/.*\.js$/,
              loader: "imports-loader?define=>false,this=>window"
              },*/
            // {
            //     test: require.resolve('jquery'),
            //     loader: 'expose-loader?jQuery!expose-loader?$',
            // },
        ]
    },
    //devtool: 'inline-source-map',
    devtool: 'source-map',
    devServer: {
        lazy: false,
        inline: true,
        contentBase: [path.join(__dirname, 'dist'), path.join(__dirname, 'public')],
        publicPath: '/',
        watchContentBase: true,
        compress: true,
        //progress: true,
        hot: false,
        //hotOnly: true,
        port: 9000,
        host: "0.0.0.0",
        allowedHosts: ['*'],

        watchOptions: {
            aggregateTimeout: 1000,
            //            ignored: /.*/,
            //ignored: /node_modules/
        },
        before: (app) => {
            app.get('/_foo/logout', function (req, res, next) {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="Prototype Access"');
                res.end('Access denied');
            });
            
            //let allowedUsers = process.env.AUTH_USER.split(',');

            app.all('*', function (req, res, next) {
                console.log('req=', req.url);
                //console.log('setting up auth, env=', process.env);
                if (process.env.AUTH_USER && process.env.AUTH_PASSWORD) {
                    var credentials = auth(req);
                    //console.log('provided creds=', credentials);
                    if (!credentials || (!allowedUsers.includes(credentials.name))
                        || credentials.pass !== process.env.AUTH_PASSWORD) {

                        if (req.url.match(/\.map$/)) {
                            next(); // workound firefox creds sourcemap thing
                        } else {

                            res.statusCode = 401;
                            res.setHeader('WWW-Authenticate', 'Basic realm="Prototype Access"');
                            res.end('Access denied');
                        }
                    } else {
                        next();
                    }
                } else {
                    next();
                }
                console.log('res=', res.statusCode);
            });
        },

        proxy: {
            "/api": { target: process.env.OPENSECRET_API_HOST || "http://localhost:8001",
                      logLevel: 'debug',
                      changeOrigin: true,

                    }
        }
    },
    node: {
        fs: "empty"
    },
    plugins: [
        new webpack.ProvidePlugin({
            'jQuery': 'jquery',
            '$': 'jquery',
            'window.$': 'jquery',
            'window.jQuery': 'jquery',
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin({name: "vendor", filename: "vendor.bundle.js"}),
        new ExtractTextPlugin({allChunks: true, filename: "[name].css"}),
        // new HtmlWebpackPlugin({
        //     template: 'src/uploader.html',
        //     title: 'LDO Upload Test',
        //     filename: 'upload.html',
        //         excludeChunks: ['app']
        // }),
        new HtmlWebpackPlugin({
            template: 'src/AppTemplate.html',
            title: 'Knowledge | Mattersmith'
        }
        ),
        new webpack.EnvironmentPlugin({
            OPENSECRET_API_URL: undefined,
            OPENSECRET_UPLOAD_URL: undefined
        }),

        /*,
          new webpack.ProvidePlugin({
          'handlebars': 'handlebars'
          })*/
    ]
};
