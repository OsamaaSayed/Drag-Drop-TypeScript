const path = require('path'); //! webpack uses nodejs features
const CleanPlugin = require('clean-webpack-plugin'); //! this plugin to clean up the dist folder whenever we rebuild our project (When webpack runs in production mode, the clean-webpack-plugin will be executed before the build process starts, and it will remove any files and directories in the dist directory. This ensures that the output directory is always clean and up-to-date before the new files are generated.)

module.exports = {
    mode: 'production',
    entry: './src/app.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), //! webpack needs the output directory as absolute path
    },
    devtool: 'none',
    module: { //! just a file , to tell webpack how to work with the files it finds(app.ts file and how to deal with the imports in the app.ts)
        rules: [ //! setup multiple rules that should be applied to all those files 
            {
                test: /\.ts$/, //! regex to tell webpack you wanna check for files ends with .ts 
                use: 'ts-loader', //! specifies what webpack should do with those files (any typescript file it finds should be handled by typescript loader, it transpiling your TypeScript code into JavaScript, and makes type-checking, and can cache previous compilations and only recompile the files that have changed since the last build)
                exclude: /node-modules/,
            }
        ]
    },
    resolve: {  //! tells webpack which file extensions it adds to the imports it finds (to bundle them in one file at the end)
        extensions: ['.ts', '.js']
    },
    plugins: [ //! plugins will be applied to the entire output project (optimize your code for performance and reduce the size of your output files)
        new CleanPlugin.CleanWebpackPlugin()
    ]
}
